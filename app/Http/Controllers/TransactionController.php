<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\User;
use App\Models\Inventory;
use App\Models\Deposit;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class TransactionController extends Controller
{
    // Menampilkan halaman POS (Mesin Kasir)
    public function create()
    {
        // Ambil daftar investor, KECUALI user yang sedang login saat ini (Kasir)
        $investors = User::where('id', '!=', auth()->id())
                         ->orderBy('name')
                         ->get(['id', 'name', 'email']);
        
        return Inertia::render('POS/Create', [
            'investors' => $investors
        ]);
    }

    // Memproses pembayaran dan menyimpan ke Database
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

    DB::beginTransaction();
    try {
        // 1. Hitung Total Transaksi
        $totalBelanja = collect($request->cart)->sum(fn($item) => $item['buy_price'] * $item['qty']);

        // 2. LOGIKA POTONG SALDO (Split 50:50 jika ada JV)
        if ($request->deposit_deduction > 0) {
            if ($partner) {
                // Bagi dua potongan saldo
                $halfDeduction = $request->deposit_deduction / 2;

                // Cari Brankas Pembeli Utama (Buatkan otomatis kalau belum ada!)
                $buyerDeposit = Deposit::firstOrCreate(
                    ['user_id' => $buyer->id],
                    ['manager_id' => auth()->id(), 'balance' => 0, 'status' => 'active']
                );
                $buyerDeposit->balance -= $halfDeduction;
                $buyerDeposit->save();

                // Cari Brankas Partner (Buatkan otomatis kalau belum ada!)
                $partnerDeposit = Deposit::firstOrCreate(
                    ['user_id' => $partner->id],
                    ['manager_id' => auth()->id(), 'balance' => 0, 'status' => 'active']
                );
                $partnerDeposit->balance -= $halfDeduction;
                $partnerDeposit->save();
            } else {
                // Jika tidak ada JV, potong full ke pembeli utama
                $deposit = Deposit::firstOrCreate(
                    ['user_id' => $buyer->id],
                    ['manager_id' => auth()->id(), 'balance' => 0, 'status' => 'active']
                );
                $deposit->balance -= $request->deposit_deduction;
                $deposit->save();
            }
        }
        // 3. LOGIKA PEMBAGIAN BARANG (Ganjil-Genap)
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
                // Jika genap (misal 10), bagi 5-5. Jika ganjil (misal 11), bagi 6-5.
                $buyerShare = ceil($qty / 2);
                $partnerShare = floor($qty / 2);

                // Catat distribusi barang untuk Pembeli Utama
                Inventory::updateOrCreate(
                    ['user_id' => $buyer->id, 'item_id' => $item['id']],
                    ['quantity' => DB::raw("quantity + $buyerShare")]
                );

                // Catat distribusi barang untuk Partner
                Inventory::updateOrCreate(
                    ['user_id' => $partner->id, 'item_id' => $item['id']],
                    ['quantity' => DB::raw("quantity + $partnerShare")]
                );
            } else {
                // Tidak ada JV, semua barang masuk ke pembeli utama
                Inventory::updateOrCreate(
                    ['user_id' => $buyer->id, 'item_id' => $item['id']],
                    ['quantity' => DB::raw("quantity + $qty")]
                );
            }

            // Simpan detail item transaksi untuk history
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
        
        // 1. LOG ERROR ASLI KE DALAM FILE SYSTEM (Aman dari user)
        \Illuminate\Support\Facades\Log::error('Kasir Error: ' . $e->getMessage());
        
        // 2. KELUARKAN PESAN GENERIC YANG AMAN KE FRONTEND
        return back()->withErrors(['error' => 'Transaksi dibatalkan. Terjadi kesalahan sistem internal. Segera beritahu IT.']);
    }
    }

    // Nanti kita buat halaman struknya di sini
    public function receipt(Transaction $transaction)
    {
        $transaction->load(['cashier', 'items.item']);
        return Inertia::render('POS/Receipt', ['transaction' => $transaction]);
    }
}