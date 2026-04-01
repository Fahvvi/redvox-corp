<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController extends Controller
{
    // Menampilkan daftar semua user
    public function index()
    {
        $users = User::orderBy('name')->get();
        return Inertia::render('Users/Index', [
            'users' => $users
        ]);
    }

    // Mengubah jabatan/role user
    public function updateRole(Request $request, User $user)
    {
        // Tambahkan 'vip' di dalam daftar role yang diizinkan
        $request->validate([
            'role' => 'required|in:admin,vip,user', 
        ]);

        if ($user->id === auth()->id()) {
            return back()->withErrors(['error' => 'Anda tidak bisa mengubah role Anda sendiri!']);
        }

        $user->update(['role' => $request->role]);

        return back()->with('success', "Hak akses {$user->name} berhasil diubah menjadi " . strtoupper($request->role) . "!");
    }
}