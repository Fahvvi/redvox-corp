<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\User;
use App\Models\Deposit;
use App\Models\Inventory;
use App\Models\Storage;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TransactionController extends Controller
{
    // ==========================================
    // 1. FUNGSI UNTUK MENAMPILKAN HALAMAN KASIR
    // ==========================================
    public function create()
    {
        // Cukup cari tahu apakah Kasir yang login punya Partner JV
        $partner = auth()->user()->partner_id ? User::find(auth()->user()->partner_id) : null;
        
        return Inertia::render('POS/Create', [
            'partner' => $partner
        ]);
    }

    // ==========================================
    // 2. FUNGSI UNTUK MEMPROSES TRANSAKSI (STORE)
    // ==========================================
    public function store(Request $request)
    {
        $request->validate([
            'supplier_name' => 'required|string',
            'cash_deduction' => 'required|numeric|min:0',
            'deposit_deduction' => 'required|numeric|min:0',
            'cart' => 'required|array',
            'action_type' => 'required|in:beli,jual',
            'transaction_type' => 'required|in:standar,korporat,dinamis',
            'dynamic_adjustment' => 'numeric',
        ]);

        $buyer = auth()->user();
        $partner = $buyer->partner_id ? User::find($buyer->partner_id) : null;

        // -----------------------------------------------------------------
        // [KEAMANAN] HITUNG ULANG TOTAL DI SERVER (Jangan percaya frontend)
        // -----------------------------------------------------------------
        $calculatedTotal = 0;
        foreach ($request->cart as $item) {
            // Tentukan base price berdasarkan aksi Jual / Beli
            $basePrice = $request->action_type === 'jual' 
                ? (isset($item['sell_price']) && $item['sell_price'] !== 'LOCKED' ? (float)$item['sell_price'] : 0) 
                : (float)$item['buy_price'];

            // Terapkan kenaikan harga 33% jika jalur Korporat
            if ($request->transaction_type === 'korporat') {
                $basePrice = $basePrice * 1.33;
            }

            $calculatedTotal += ($basePrice * (int)$item['qty']);
        }

        // Terapkan penyesuaian khusus (diskon/tambahan)
        if ($request->transaction_type === 'dinamis') {
            $calculatedTotal += (float)$request->dynamic_adjustment;
        }

        if ($calculatedTotal < 0) {
            $calculatedTotal = 0;
        }

        // Validasi apakah kas yang dimasukkan sesuai dengan hasil perhitungan server
        if (round($request->cash_deduction + $request->deposit_deduction) != round($calculatedTotal)) {
            return back()->withErrors(['payment' => 'Total pembayaran tidak valid. Transaksi terindikasi dimanipulasi!']);
        }

        DB::beginTransaction();
        try {
            // -----------------------------------------------------------------
            // LOGIKA POTONG SALDO DEPOSIT (Split 50:50 jika ada JV)
            // -----------------------------------------------------------------
            if ($request->deposit_deduction > 0) {
                // Jika Kasir "Menjual", artinya Uang MASUK ke Deposit (+). Jika "Membeli", Uang KELUAR (-).
                $uangMultiplier = $request->action_type === 'jual' ? 1 : -1; 
                $nominalMutasi = $request->deposit_deduction * $uangMultiplier;

                if ($partner) {
                    $halfDeduction = $nominalMutasi / 2;

                    $buyerDeposit = Deposit::firstOrCreate(
                        ['user_id' => $buyer->id],
                        ['manager_id' => auth()->id(), 'balance' => 0, 'status' => 'active']
                    );
                    $buyerDeposit->balance += $halfDeduction;
                    $buyerDeposit->save();

                    $partnerDeposit = Deposit::firstOrCreate(
                        ['user_id' => $partner->id],
                        ['manager_id' => auth()->id(), 'balance' => 0, 'status' => 'active']
                    );
                    $partnerDeposit->balance += $halfDeduction;
                    $partnerDeposit->save();
                } else {
                    $deposit = Deposit::firstOrCreate(
                        ['user_id' => $buyer->id],
                        ['manager_id' => auth()->id(), 'balance' => 0, 'status' => 'active']
                    );
                    $deposit->balance += $nominalMutasi;
                    $deposit->save();
                }
            }

            // -----------------------------------------------------------------
            // PENCATATAN TRANSAKSI UTAMA
            // -----------------------------------------------------------------
            $transaction = Transaction::create([
                'invoice_number' => 'INV-' . strtoupper(uniqid()),
                'cashier_id' => $buyer->id,
                'supplier_name' => $request->supplier_name,
                'total_amount' => $calculatedTotal,
                'deposit_deduction' => $request->deposit_deduction,
                'cash_deduction' => $request->cash_deduction,
                // Pastikan ketiga kolom ini sudah ada di migration table transactions!
                'action_type' => $request->action_type, 
                'transaction_type' => $request->transaction_type,
                'dynamic_adjustment' => $request->dynamic_adjustment ?? 0,
            ]);

            // -----------------------------------------------------------------
            // LOGIKA INVENTARIS BARANG (Split 50:50 jika ada JV)
            // -----------------------------------------------------------------
            // Jika Kasir "Membeli", Barang MASUK (+). Jika "Menjual", Barang KELUAR (-).
            $barangMultiplier = $request->action_type === 'beli' ? 1 : -1;

            foreach ($request->cart as $item) {
                $qty = (int)$item['qty'];

                // Hitung subtotal harga satuan pada saat ini untuk disimpan di history
                $basePrice = $request->action_type === 'jual' 
                    ? (isset($item['sell_price']) && $item['sell_price'] !== 'LOCKED' ? (float)$item['sell_price'] : 0) 
                    : (float)$item['buy_price'];

                if ($request->transaction_type === 'korporat') {
                    $basePrice = $basePrice * 1.33;
                }

                if ($partner) {
                    $buyerShare = ceil($qty / 2);
                    $partnerShare = floor($qty / 2);

                    // BARANG MENGAMBANG (storage_id = null) UNTUK KASIR
                    $bInv = Inventory::firstOrCreate(
                        ['user_id' => $buyer->id, 'item_id' => $item['id'], 'storage_id' => null],
                        ['quantity' => 0]
                    );
                    $bInv->quantity += ($buyerShare * $barangMultiplier);
                    $bInv->save();

                    // BARANG MENGAMBANG UNTUK PARTNER
                    if ($partnerShare > 0) {
                        $pInv = Inventory::firstOrCreate(
                            ['user_id' => $partner->id, 'item_id' => $item['id'], 'storage_id' => null],
                            ['quantity' => 0]
                        );
                        $pInv->quantity += ($partnerShare * $barangMultiplier);
                        $pInv->save();
                    }
                } else {
                    $bInv = Inventory::firstOrCreate(
                        ['user_id' => $buyer->id, 'item_id' => $item['id'], 'storage_id' => null],
                        ['quantity' => 0]
                    );
                    $bInv->quantity += ($qty * $barangMultiplier);
                    $bInv->save();
                }

                // Catat detil rincian barang di nota
                TransactionItem::create([
                    'transaction_id' => $transaction->id,
                    'item_id' => $item['id'],
                    'quantity' => $qty,
                    'subtotal_price' => $basePrice * $qty,
                ]);
            }

            DB::commit();
            return redirect()->route('pos.receipt', $transaction->id);

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Gagal Memproses Data: ' . $e->getMessage()]);
        }
    }

    // ==========================================
    // 3. FUNGSI UNTUK MENAMPILKAN STRUK (RECEIPT)
    // ==========================================
    public function receipt(Transaction $transaction)
    {
        $transaction->load(['cashier', 'items.item']);
        return Inertia::render('POS/Receipt', ['transaction' => $transaction]);
    }
}