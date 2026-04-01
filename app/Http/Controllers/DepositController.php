<?php

namespace App\Http\Controllers;

use App\Models\Deposit;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DepositController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        // Ambil data brankas deposit milik user yang login
        $deposit = Deposit::firstOrCreate(
            ['user_id' => $user->id],
            ['manager_id' => 1, 'balance' => 0, 'status' => 'active']
        );

        // Ambil data partner jika sudah punya
        $partner = $user->partner_id ? User::find($user->partner_id) : null;

        // Cari warga lain yang belum punya partner untuk ditawarkan JV
        $availableUsers = User::where('id', '!=', $user->id)
            ->whereNull('partner_id')
            ->get(['id', 'name', 'email']);

        return Inertia::render('Deposit/Index', [
            'deposit' => $deposit,
            'partner' => $partner,
            'availableUsers' => $availableUsers
        ]);
    }

    // Fungsi Warga Menambah Deposit Sendiri
    public function topup(Request $request)
    {
        $request->validate(['amount' => 'required|numeric|min:1']);

        $deposit = Deposit::firstOrCreate(
            ['user_id' => auth()->id()],
            ['manager_id' => 1, 'balance' => 0, 'status' => 'active']
        );

        $deposit->balance += $request->amount;
        $deposit->save();

        return back()->with('success', 'Uang berhasil ditambahkan ke Brankas Deposit!');
    }

    // Fungsi Menggabungkan 2 Akun menjadi Joint Venture
    public function setPartner(Request $request)
    {
        $request->validate(['partner_id' => 'required|exists:users,id']);

        $user = auth()->user();
        $partner = User::find($request->partner_id);

        // Kunci kedua akun agar saling terhubung (Reciprocal)
        $user->partner_id = $partner->id;
        $user->save();

        $partner->partner_id = $user->id;
        $partner->save();

        return back()->with('success', 'Joint Venture dengan ' . $partner->name . ' resmi dibentuk!');
    }
}