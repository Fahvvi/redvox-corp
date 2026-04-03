<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index()
    {
        // Urutkan dari yang paling baru mendaftar (agar yang pending ada di atas)
        $users = User::orderBy('created_at', 'desc')->get();
        
        return Inertia::render('Users/Index', [
            'users' => $users
        ]);
    }

    public function updateRole(Request $request, User $user)
    {
        $request->validate([
            'role' => 'required|in:pending,user,vip,admin' // Tambahkan 'pending' di sini
        ]);

        $user->update(['role' => $request->role]);

        return back()->with('success', "Status akses {$user->name} berhasil diperbarui!");
    }

    public function destroy(User $user)
    {
        $name = $user->name;
        $user->delete();

        return back()->with('success', "Pendaftaran akun {$name} berhasil ditolak dan dihapus permanen.");
    }
}