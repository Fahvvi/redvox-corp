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
    public function update(Request $request, $id) 
    {
        // 1. Cari barang secara manual (mencegah error 405 / Route Binding)
        $item = \App\Models\Item::findOrFail($id);

        // 2. Amankan harga beli lama SEBELUM di-update
        $oldBuyPrice = $item->buy_price;

        // 3. Siapkan data yang akan diupdate (dari form React)
        $dataToUpdate = $request->all();

        // 4. Suntikkan harga lama ke kolom previous_buy_price
        $dataToUpdate['previous_buy_price'] = $oldBuyPrice;

        // 5. Eksekusi update ke database (Hanya 1 kali panggil)
        $item->update($dataToUpdate);

        // --- OPSIONAL: SUNTIKAN DISCORD WEBHOOK ---
        /*
        $webhookUrl = 'URL_WEBHOOK_ANDA';
        \Illuminate\Support\Facades\Http::post($webhookUrl, [
            'content' => "📢 **Update Harga:** " . strtoupper($item->name) . " sekarang $" . $item->buy_price . " (Sebelumnya $" . $oldBuyPrice . ")"
        ]);
        */

        return redirect()->back()->with('success', 'Barang berhasil diupdate.');
    }

    // FITUR NOTIF
    public function getRecentUpdates()
    {
        // CACHE MAGIC: Kita simpan hasil pencarian di RAM selama 5 detik.
        // Walau ada 1.000 ketukan per detik, Database HANYA dicek 1 kali tiap 5 detik!
        $text = \Illuminate\Support\Facades\Cache::remember('recent_price_updates', 5, function () {
            
            // Cari barang yang diubah dalam 10 MENIT terakhir (subMinutes(10))
            $recentItems = \App\Models\Item::where('updated_at', '>=', now()->subMinutes(10))->get();

            if ($recentItems->isEmpty()) {
                return null;
            }

            $changes = [];
            foreach ($recentItems as $item) {
                $currentPrice = $item->buy_price;
                // Jika harga lama kosong, anggap sama dengan harga baru
                $prevPrice = $item->previous_buy_price ?? $currentPrice; 
                
                $diff = $currentPrice - $prevPrice;
                $diffText = "";
                
                if ($diff > 0) {
                    $diffText = " (+$" . $diff . ")"; // Harga Naik
                } elseif ($diff < 0) {
                    $diffText = " (-$" . abs($diff) . ")"; // Harga Turun
                }

                // Format: BENSIN: $150 (+$50)
                $changes[] = strtoupper($item->name) . ": $" . $currentPrice . $diffText;
            }

            return implode(" 🔹 ", $changes);
        });

        return response()->json(['message' => $text]);
    }

    public function destroy(Item $item)
    {
        $item->delete();
        return back()->with('success', 'Material telah dihapus dari daftar.');
    }
}