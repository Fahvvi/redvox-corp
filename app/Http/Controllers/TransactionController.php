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
        // TAMBAHKAN 'partner_id' di dalam get()
        $investors = User::where('id', '!=', auth()->id())
                         ->orderBy('name')
                         ->get(['id', 'name', 'email', 'partner_id']); 
        
        return Inertia::render('POS/Create', [
            'investors' => $investors
        ]);
    }

    // ==========================================
    // 2. FUNGSI UNTUK MEMPROSES PEMBAYARAN & BARANG
    // ==========================================
    public function store(Request $request)
    {
        $request->validate([
            'investor_id' => 'required|exists:users,id',
            'supplier_name' => 'required|string',
            'cash_deduction' => 'required|numeric|min:0',
            'deposit_deduction' => 'required|numeric|min:0',
            'cart' => 'required|array',
        ]);

        $buyer = User::find($request->investor_id);
        $partner = $buyer->partner_id ? User::find($buyer->partner_id) : null;

        $totalBelanja = collect($request->cart)->sum(fn($item) => $item['buy_price'] * $item['qty']);

        if (($request->cash_deduction + $request->deposit_deduction) != $totalBelanja) {
            return back()->withErrors(['payment' => 'Total pembayaran (Cash + Deposit) tidak sesuai total belanja!']);
        }

        DB::beginTransaction();
        try {
            // Buat Gudang Default (Gudang Flint) jika belum ada di database
            $defaultStorage = Storage::firstOrCreate(
                ['id' => 1],
                ['name' => 'Gudang Flint', 'type' => 'warehouse', 'capacity' => 5000]
            );

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
                'cashier_id' => auth()->id(),
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

                    $bInv = Inventory::firstOrCreate(
                        ['user_id' => $buyer->id, 'item_id' => $item['id']],
                        ['quantity' => 0, 'storage_id' => $defaultStorage->id]
                    );
                    $bInv->quantity += $buyerShare;
                    $bInv->save();

                    if ($partnerShare > 0) {
                        $pInv = Inventory::firstOrCreate(
                            ['user_id' => $partner->id, 'item_id' => $item['id']],
                            ['quantity' => 0, 'storage_id' => $defaultStorage->id]
                        );
                        $pInv->quantity += $partnerShare;
                        $pInv->save();
                    }
                } else {
                    $bInv = Inventory::firstOrCreate(
                        ['user_id' => $buyer->id, 'item_id' => $item['id']],
                        ['quantity' => 0, 'storage_id' => $defaultStorage->id]
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

        }   catch (\Exception $e) {
            DB::rollBack();
            // KITA MUNCULKAN ERROR ASLINYA KE LAYAR AGAR KETAHUAN PENYAKITNYA!
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