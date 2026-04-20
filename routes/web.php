<?php

use App\Http\Controllers\ItemController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\DepositController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\StorageController;
use App\Http\Controllers\InventoryController;
use Illuminate\Support\Facades\Route;
use GameQ\GameQ;
use Illuminate\Support\Facades\Cache;

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

// RUTE RECEIPT

Route::get('/receipt/{transaction}', [TransactionController::class, 'receipt'])->name('pos.receipt');
// Tambahkan baris ini di routes/web.php
Route::get('/price-updates', [\App\Http\Controllers\ItemController::class, 'getRecentUpdates']);


// ==========================================
// RUTE KHUSUS BOT DISCORD
// ==========================================
Route::get('/api/bot/items', function () {
    return response()->json(\App\Models\Item::all());
});

// ==========================================
// API STATUS SERVER MTA INDOLIFE
// ==========================================
Route::get('/api/server-status', function () {
    $gameq = new GameQ();
    $gameq->addServer([
        'type' => 'mta',
        'host' => '15.235.160.190:22003',
        'id'   => 'indolife',
        'options' => [
            // Memaksa GameQ menggunakan port query standar MTA jika port bawaan gagal
            'query_port' => 22126 
        ]
    ]);
    
    $results = $gameq->process();
    $serverData = $results['indolife'] ?? null;

    // JIKA INGIN MELIHAT ISI MENTAH DARI SERVER, HAPUS TANDA // DI BAWAH INI:
    // return response()->json($serverData);

    // Jika gagal ping
    if (!$serverData || empty($serverData['gq_online'])) {
        return response()->json([
            'status' => 'offline', 
            'players' => [], 
            'count' => 0, 
            'max' => 0,
            'debug' => 'Ping UDP diblokir atau server down.'
        ]);
    }

    // Mengambil nama-nama pemain
    $players = [];
    if (isset($serverData['players']) && is_array($serverData['players'])) {
        foreach ($serverData['players'] as $player) {
            // MTA kadang menggunakan key 'name' atau 'player'
            if (!empty($player['name'])) {
                $players[] = $player['name'];
            } elseif (!empty($player['player'])) {
                $players[] = $player['player'];
            }
        }
    }

    return response()->json([
        'status' => 'online',
        'hostname' => $serverData['gq_hostname'] ?? 'Indolife Roleplay',
        // Harus menggunakan gq_ untuk variabel bawaan GameQ
        'count' => $serverData['gq_numplayers'] ?? 0,
        'max' => $serverData['gq_maxplayers'] ?? 0,
        'players' => $players
    ]);
});