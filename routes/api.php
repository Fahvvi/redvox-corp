<?php

use App\Models\Item;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/bot/items', function (Request $request) {
    // Mengambil semua barang yang harganya bukan 'LOCKED' dan mengirimnya ke Bot
    $items = Item::all();
    return response()->json($items);
});

