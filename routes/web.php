<?php

use App\Http\Controllers\ItemController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\DepositController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\StorageController;
use App\Http\Controllers\InventoryController;
use Illuminate\Support\Facades\Route;

// ==========================================
// RUTE PUBLIK (GUEST)
// ==========================================
Route::get('/', [ItemController::class, 'index'])->name('landing');
Route::get('/crafting-wiki', [ItemController::class, 'wiki'])->name('wiki');

// ==========================================
// RUTE SISTEM INTERNAL (LOGGED IN & APPROVED)
// ==========================================
Route::middleware(['auth', 'verified'])->group(function () {
    
    // ==========================================
    // LEVEL 1: WARGA BIASA, VIP, & ADMIN
    // Fitur Operasional Sehari-hari
    // ==========================================
    Route::middleware(['role:user,vip,admin'])->group(function () {
        
        // Dashboard & Kalkulator Internal
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
        Route::get('/kalkulator', [ItemController::class, 'internalIndex'])->name('kalkulator');
        
        // Fitur Inventaris & Lokasi
        Route::get('/inventory', [InventoryController::class, 'index'])->name('inventory.index');
        Route::post('/inventory/location', [InventoryController::class, 'storeLocation'])->name('inventory.storeLocation');
        Route::post('/inventory/move', [InventoryController::class, 'moveItem'])->name('inventory.move');
        Route::delete('/inventory/storage/{storage}', [InventoryController::class, 'deleteStorage'])->name('inventory.deleteStorage');

        // Kasir & Cetak Struk (Sekarang Warga Biasa Bisa Akses)
        Route::get('/pos', [TransactionController::class, 'create'])->name('pos.create');
        Route::post('/pos', [TransactionController::class, 'store'])->name('pos.store');
        Route::get('/receipt/{transaction}', [TransactionController::class, 'receipt'])->name('pos.receipt');
    });

    // ==========================================
    // LEVEL 2: KHUSUS VIP & ADMIN
    // Keuangan Perusahaan & Joint Venture
    // ==========================================
    Route::middleware(['role:vip,admin'])->group(function () {
        Route::get('/deposits', [DepositController::class, 'index'])->name('deposits.index');
        Route::post('/deposits/topup', [DepositController::class, 'topup'])->name('deposits.topup');
        Route::post('/deposits/partner', [DepositController::class, 'setPartner'])->name('deposits.partner');
    });

    // ==========================================
    // LEVEL 3: KHUSUS SUPER ADMIN
    // Manajemen Inti Perusahaan
    // ==========================================
    Route::middleware(['role:admin'])->group(function () {
        
        // Manajemen Hak Akses & Akun Warga
        Route::get('/users', [UserController::class, 'index'])->name('users.index');
        Route::patch('/users/{user}/role', [UserController::class, 'updateRole'])->name('users.updateRole');
        Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy'); 

        // Manajemen Material & Harga Dasar
        Route::get('/items-management', [ItemController::class, 'manage'])->name('items.manage');
        Route::post('/items', [ItemController::class, 'store'])->name('items.store');
        Route::patch('/items/{item}', [ItemController::class, 'update'])->name('items.update');
        Route::delete('/items/{item}', [ItemController::class, 'destroy'])->name('items.destroy');

        // Manajemen Master Gudang & Kendaraan Baru
        Route::resource('storages', StorageController::class);
    });

});

require __DIR__.'/auth.php';

// ==========================================
// RUTE KHUSUS BOT DISCORD
// ==========================================
Route::get('/api/bot/items', function () {
    return response()->json(\App\Models\Item::all());
});