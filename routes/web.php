<?php

use App\Http\Controllers\ItemController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\DepositController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\StorageController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// ==========================================
// RUTE PUBLIK (GUEST)
// ==========================================
Route::get('/', [ItemController::class, 'index'])->name('kalkulator');
Route::get('/crafting-wiki', [ItemController::class, 'wiki'])->name('wiki');

// ==========================================
// RUTE MEMBER & INVESTOR (LOGGED IN)
// ==========================================
Route::middleware(['auth', 'verified'])->group(function () {
    
    // Dashboard Utama
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Fitur Inventaris (Melihat stok di bagasi kendaraan)
    Route::get('/inventory', [StorageController::class, 'inventoryReport'])->name('inventory.report');

    // ==========================================
    // RUTE DEPOSIT & JOINT VENTURE (Bisa diakses semua Warga yang Login)
    // ==========================================
    Route::get('/deposits', [DepositController::class, 'index'])->name('deposits.index');
    Route::post('/deposits/topup', [DepositController::class, 'topup'])->name('deposits.topup');
    Route::post('/deposits/partner', [DepositController::class, 'setPartner'])->name('deposits.partner');

    // ==========================================
    // RUTE ADMIN / OWNER (FICO & MANAGEMENT SAJA)
    // ==========================================
    Route::middleware(['can:manage-redvox'])->group(function () {
        
        // Manajemen User & Role (Hanya Admin)
        Route::get('/users', [App\Http\Controllers\UserController::class, 'index'])->name('users.index');
        Route::patch('/users/{user}/role', [App\Http\Controllers\UserController::class, 'updateRole'])->name('users.updateRole');
        
        // Manajemen Harga Dasar
        Route::resource('items', ItemController::class)->except(['index', 'show']);

        // Kasir & Transaksi
        Route::get('/pos', [TransactionController::class, 'create'])->name('pos.create');
        Route::post('/pos', [TransactionController::class, 'store'])->name('pos.store');
        Route::get('/receipt/{transaction}', [TransactionController::class, 'receipt'])->name('pos.receipt');

        // Manajemen Gudang & Kendaraan
        Route::resource('storages', StorageController::class);
    });
});

require __DIR__.'/auth.php';