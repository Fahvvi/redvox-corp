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
    // ==========================================
    // 1. UPDATE FUNGSI CREATE
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
    // 2. UPDATE FUNGSI STORE
    // ==========================================
    public function store(Request $request)
    {
        $request->validate([
            'supplier_name' => 'required|string',
            'cash_deduction' => 'required|numeric|min:0',
            'deposit_deduction' => 'required|numeric|min:0',
            'cart' => 'required|array',
        ]);

        // Pembeli OTOMATIS adalah Kasir yang sedang login!
        $buyer = auth()->user();
        $partner = $buyer->partner_id ? User::find($buyer->partner_id) : null;

        $totalBelanja = collect($request->cart)->sum(fn($item) => $item['buy_price'] * $item['qty']);

        if (($request->cash_deduction + $request->deposit_deduction) != $totalBelanja) {
            return back()->withErrors(['payment' => 'Total pembayaran (Cash + Deposit) tidak sesuai total belanja!']);
        }

        DB::beginTransaction();
        try {
            // LOGIKA POTONG SALDO DEPOSIT (Split 50:50 jika ada JV)
            if ($request->deposit_deduction > 0) {
                if ($partner) {
                    $halfDeduction = $request->deposit_deduction / 2;

                    $buyerDeposit = Deposit::firstOrCreate(
                        ['user_id' => $buyer->id],
                        ['manager_id' => auth()->id(), 'balance' => 0, 'status' => 'active']
                    );
                    $buyerDeposit->balance -= $halfDeduction;
                    $buyerDeposit->save();

                    $partnerDeposit = Deposit::firstOrCreate(
                        ['user_id' => $partner->id],
                        ['manager_id' => auth()->id(), 'balance' => 0, 'status' => 'active']
                    );
                    $partnerDeposit->balance -= $halfDeduction;
                    $partnerDeposit->save();
                } else {
                    $deposit = Deposit::firstOrCreate(
                        ['user_id' => $buyer->id],
                        ['manager_id' => auth()->id(), 'balance' => 0, 'status' => 'active']
                    );
                    $deposit->balance -= $request->deposit_deduction;
                    $deposit->save();
                }
            }

            // LOGIKA TRANSAKSI & PEMBAGIAN BARANG (Ganjil-Genap)
            $transaction = Transaction::create([
                'invoice_number' => 'INV-' . strtoupper(uniqid()),
                'cashier_id' => $buyer->id,
                'supplier_name' => $request->supplier_name,
                'total_amount' => $totalBelanja,
                'deposit_deduction' => $request->deposit_deduction,
                'cash_deduction' => $request->cash_deduction,
            ]);

            foreach ($request->cart as $item) {
                $qty = $item['qty'];

                if ($partner) {
                    $buyerShare = ceil($qty / 2);
                    $partnerShare = floor($qty / 2);

                    // BARANG MENGAMBANG (storage_id = null) UNTUK PEMBELI
                    $bInv = Inventory::firstOrCreate(
                        ['user_id' => $buyer->id, 'item_id' => $item['id'], 'storage_id' => null],
                        ['quantity' => 0]
                    );
                    $bInv->quantity += $buyerShare;
                    $bInv->save();

                    // BARANG MENGAMBANG UNTUK PARTNER
                    if ($partnerShare > 0) {
                        $pInv = Inventory::firstOrCreate(
                            ['user_id' => $partner->id, 'item_id' => $item['id'], 'storage_id' => null],
                            ['quantity' => 0]
                        );
                        $pInv->quantity += $partnerShare;
                        $pInv->save();
                    }
                } else {
                    $bInv = Inventory::firstOrCreate(
                        ['user_id' => $buyer->id, 'item_id' => $item['id'], 'storage_id' => null],
                        ['quantity' => 0]
                    );
                    $bInv->quantity += $qty;
                    $bInv->save();
                }

                TransactionItem::create([
                    'transaction_id' => $transaction->id,
                    'item_id' => $item['id'],
                    'quantity' => $qty,
                    'subtotal_price' => $item['buy_price'] * $qty,
                ]);
            }

            DB::commit();
            return redirect()->route('pos.receipt', $transaction->id);

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'DEBUG ERROR: ' . $e->getMessage() . ' (Baris: ' . $e->getLine() . ')']);
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