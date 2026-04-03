<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    // Gunakan ...$roles agar bisa menangkap banyak parameter role sekaligus
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        // Jika belum login, lempar ke login
        if (! $request->user()) {
            return redirect('/login');
        }

        // Cek apakah role user saat ini ada di dalam daftar yang diizinkan
        if (! in_array($request->user()->role, $roles)) {
            // Jika tidak punya akses, tolak (Forbidden)
            abort(403, 'Akses Ditolak. Anda tidak memiliki izin untuk halaman ini.');
        }

        return $next($request);
    }
}