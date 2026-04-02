<?php

use App\Http\Controllers\ItemController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\DepositController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\StorageController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// ==========================================
// RUTE PUBLIK (GUEST)
// ==========================================
Route::get('/', [App\Http\Controllers\ItemController::class, 'index'])->name('landing');
Route::get('/crafting-wiki', [App\Http\Controllers\ItemController::class, 'wiki'])->name('wiki');

// ==========================================
// RUTE MEMBER & INVESTOR (LOGGED IN)
// ==========================================
Route::middleware(['auth', 'verified'])->group(function () {
    
    // Dashboard Utama
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/kalkulator', [App\Http\Controllers\ItemController::class, 'internalIndex'])->name('kalkulator');
    // Fitur Inventaris (Melihat stok di bagasi kendaraan)
    Route::get('/inventory', [App\Http\Controllers\InventoryController::class, 'index'])->name('inventory.index');
    Route::post('/inventory/location', [App\Http\Controllers\InventoryController::class, 'storeLocation'])->name('inventory.storeLocation');
    Route::post('/inventory/move', [App\Http\Controllers\InventoryController::class, 'moveItem'])->name('inventory.move');
    Route::delete('/inventory/storage/{storage}', [App\Http\Controllers\InventoryController::class, 'deleteStorage'])->name('inventory.deleteStorage');

    // ==========================================
    // RUTE DEPOSIT & JOINT VENTURE (Bisa diakses semua Warga yang Login)
    // ==========================================
    Route::get('/deposits', [DepositController::class, 'index'])->name('deposits.index');
    Route::post('/deposits/topup', [DepositController::class, 'topup'])->name('deposits.topup');
    Route::post('/deposits/partner', [DepositController::class, 'setPartner'])->name('deposits.partner');

    // ==========================================
    // RUTE OPERASIONAL (ADMIN & VIP BISA AKSES)
    // ==========================================
    Route::middleware(['can:operate-pos'])->group(function () {
        
        // Manajemen Harga Dasar
        Route::resource('items', ItemController::class)->except(['index', 'show']);

        // Kasir & Transaksi
        Route::get('/pos', [TransactionController::class, 'create'])->name('pos.create');
        Route::post('/pos', [TransactionController::class, 'store'])->name('pos.store');
        Route::get('/receipt/{transaction}', [TransactionController::class, 'receipt'])->name('pos.receipt');

        // Manajemen Material & Harga
        Route::get('/items-management', [ItemController::class, 'manage'])->name('items.manage');
        Route::post('/items', [ItemController::class, 'store'])->name('items.store');
        Route::patch('/items/{item}', [ItemController::class, 'update'])->name('items.update');
        Route::delete('/items/{item}', [ItemController::class, 'destroy'])->name('items.destroy');

        // Manajemen Gudang & Kendaraan
        Route::resource('storages', StorageController::class);
    });

    // ==========================================
    // RUTE KHUSUS SUPER ADMIN (HANYA FICO)
    // ==========================================
    Route::middleware(['can:manage-users'])->group(function () {
        // Manajemen Hak Akses Warga
        Route::get('/users', [UserController::class, 'index'])->name('users.index');
        Route::patch('/users/{user}/role', [UserController::class, 'updateRole'])->name('users.updateRole');
    });
});

require __DIR__.'/auth.php';