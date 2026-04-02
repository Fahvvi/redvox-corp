<?php

namespace App\Http\Controllers;

use App\Models\Item;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ItemController extends Controller
{
    // ==========================================
    // Tampilan Kalkulator Publik (Gunakan file lama: Items/Index)
    // ==========================================
    public function index()
    {
        return Inertia::render('Items/Index', [
            'items' => Item::orderBy('category')->orderBy('name')->get()
        ]);
    }

    // Fungsi untuk Kalkulator Internal (LOGGED IN)
    public function internalIndex()
    {
        return Inertia::render('Items/Internal', [
            'items' => Item::orderBy('category')->orderBy('name')->get()
        ]);
    }

    // ==========================================
    // Tampilan Manajemen Harga (Hanya Admin/VIP)
    // ==========================================
    public function manage()
    {
        return Inertia::render('Items/Manage', [ // File baru: Items/Manage.jsx
            'items' => Item::orderBy('category')->get()
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string',
            'buy_price' => 'required|numeric|min:0',
            'sell_price' => 'required|numeric|min:0',
            'unit' => 'required|string',
        ]);

        Item::create($request->all());
        return back()->with('success', 'Material baru berhasil didaftarkan!');
    }

    // PERBAIKAN: "Item $item" ditulis dengan benar
    public function update(Request $request, Item $item) 
    {
        $request->validate([
            'buy_price' => 'required|numeric|min:0',
            'sell_price' => 'required|numeric|min:0',
        ]);

        $item->update($request->only(['buy_price', 'sell_price']));
        return back()->with('success', "Harga {$item->name} berhasil diperbarui!");
    }

    public function destroy(Item $item)
    {
        $item->delete();
        return back()->with('success', 'Material telah dihapus dari daftar.');
    }
}