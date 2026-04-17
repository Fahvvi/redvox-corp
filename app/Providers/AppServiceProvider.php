<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\URL;
use App\Models\User;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Gembok 1: Khusus Super Admin (Untuk Manage Role)
        Gate::define('manage-users', function ($user) {
            return $user->role === 'admin';
        });

        // Gembok 2: Untuk Operasional Kasir & Barang (Admin & VIP Boleh Masuk)
        Gate::define('operate-pos', function ($user) {
            return in_array($user->role, ['admin', 'vip']);
        });

        // --- HAPUS IF-NYA, LANGSUNG PAKSA HTTPS! ---
        URL::forceScheme('https');
    }
}
