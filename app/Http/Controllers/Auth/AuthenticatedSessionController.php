<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        // 1. Sistem bawaan Laravel mengecek email dan password
        $request->authenticate();

        // 2. KITA TAMBAHKAN PENGECEKAN STATUS ACC DI SINI!
        if ($request->user()->role === 'pending') {
            // Jika status masih pending, paksa Logout langsung!
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            // Kembalikan ke halaman login dengan pesan error merah di kolom email
            return back()->withErrors([
                'email' => 'Akses Ditolak: Akun Anda masih berstatus MENUNGGU ACC dari Admin. Silakan hubungi petinggi faksi.',
            ]);
        }

        // 3. Jika bukan pending (sudah di-ACC admin), izinkan masuk ke Dashboard
        $request->session()->regenerate();

        return redirect()->intended(route('dashboard', absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
