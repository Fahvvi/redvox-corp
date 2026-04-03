<?php

namespace App\Http\Controllers;

use App\Models\Item;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;

class ItemController extends Controller
{
    // ==========================================
    // Tampilan Kalkulator Publik (Gunakan file lama: Items/Index)
    // ==========================================
    public function index()
    {
        $items = Item::all(); // Mengambil data item Anda
        $leaderboards = [];

        try {
            // JURUS RAHASIA: Abaikan SSL & Menyamar jadi Browser Chrome
            $response = Http::withoutVerifying()
                ->withUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
                ->timeout(10) // Kasih waktu lebih lama (10 detik)
                ->get('https://indoliferoleplay.com/api/leaderboard');
            
            if ($response->successful()) {
                $leaderboards = $response->json();
            } else {
                // Hapus tanda // di bawah ini jika Anda ingin melihat status errornya (misal 403 atau 500)
                // dd("Error HTTP Status: " . $response->status()); 
            }
        } catch (\Exception $e) {
            // Hapus tanda // di bawah ini jika Anda ingin melihat penyebab gagalnya
            // dd("Error Sistem: " . $e->getMessage()); 
            $leaderboards = []; 
        }

        return Inertia::render('Items/Index', [
            'items' => $items,
            'leaderboardData' => $leaderboards
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
    public function manage(Request $request)
    {
        $items = Item::query()
            ->when($request->search, function ($query, $search) {
                // Pencarian tidak sensitif huruf besar/kecil
                $query->whereRaw('LOWER(name) LIKE ?', ['%' . strtolower($search) . '%']);
            })
            ->when($request->category, function ($query, $category) {
                $query->where('category', $category);
            })
            ->orderBy('category')
            ->orderBy('name')
            ->paginate(10) // Tampilkan 10 data per halaman
            ->withQueryString(); // Bawa parameter pencarian ke halaman berikutnya

        return Inertia::render('Items/Manage', [
            'items' => $items,
            'filters' => $request->only(['search', 'category'])
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