<?php

namespace App\Http\Controllers;

use App\Models\Item;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ItemController extends Controller
{
    public function index()
    {
        $items = Item::orderBy('category')->orderBy('name')->get()->map(function ($item) {
            return [
                'id' => $item->id,
                'name' => $item->name,
                'category' => $item->category,
                // Warga/Supplier HARUS tahu berapa harga beli kita ke mereka
                'buy_price' => $item->buy_price, 
                // Rahasia Dapur Redvox (Harga ke NPC), disensor untuk Guest
                'sell_price' => auth()->check() ? $item->sell_price : 'LOCKED', 
            ];
        });

        return Inertia::render('Items/Index', ['items' => $items]);
    }
}