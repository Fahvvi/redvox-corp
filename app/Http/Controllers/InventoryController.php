<?php

namespace App\Http\Controllers;

use App\Models\Inventory;
use App\Models\Storage;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class InventoryController extends Controller
{
    public function index()
    {
        $userId = auth()->id();

        // 1. Ambil Barang Mengambang (Belum masuk storage manapun)
        $floatingItems = Inventory::with('item')
            ->where('user_id', $userId)
            ->whereNull('storage_id')
            ->where('quantity', '>', 0)
            ->get();

        // 2. Ambil Tempat Penyimpanan (Gudang & Kendaraan)
        $storages = Storage::with(['inventories.item'])
            ->where('user_id', $userId)
            ->whereIn('type', ['warehouse', 'vehicle'])
            ->get();

        // 3. Ambil Daftar Paket Khusus
        $packages = Storage::with(['inventories.item'])
            ->where('user_id', $userId)
            ->where('type', 'package')
            ->get();

        // Semua storage gabungan untuk dropdown pindah barang
        $allMyStorages = Storage::where('user_id', $userId)->get(['id', 'name', 'type', 'package_type']);

        return Inertia::render('Inventory/Index', [
            'floatingItems' => $floatingItems,
            'storages' => $storages,
            'packages' => $packages,
            'allMyStorages' => $allMyStorages
        ]);
    }

    // Fungsi Membuat Tempat Baru / Paket Baru
    public function storeLocation(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'type' => 'required|in:warehouse,vehicle,package',
            'vehicle_id' => 'nullable|string',
            'location_detail' => 'nullable|string',
            'package_type' => 'nullable|in:furniture,restoran,mafia',
        ]);

        Storage::create(array_merge($request->all(), ['user_id' => auth()->id()]));

        return back()->with('success', 'Lokasi/Paket berhasil dibuat!');
    }

    // Fungsi Memindahkan Barang
    public function moveItem(Request $request)
    {
        $request->validate([
            'inventory_id' => 'required|exists:inventories,id',
            'target_storage_id' => 'required', // Bisa ID storage atau string 'float'
            'quantity' => 'required|integer|min:1',
        ]);

        DB::beginTransaction();
        try {
            $sourceInv = Inventory::lockForUpdate()->findOrFail($request->inventory_id);
            
            // Validasi kepemilikan dan jumlah
            if ($sourceInv->user_id !== auth()->id() || $sourceInv->quantity < $request->quantity) {
                return back()->withErrors(['error' => 'Jumlah barang tidak cukup atau bukan milik Anda.']);
            }

            $targetId = $request->target_storage_id === 'float' ? null : $request->target_storage_id;

            // Kurangi dari sumber
            $sourceInv->quantity -= $request->quantity;
            $sourceInv->save();

            // Tambahkan ke target
            $targetInv = Inventory::firstOrCreate(
                ['user_id' => auth()->id(), 'item_id' => $sourceInv->item_id, 'storage_id' => $targetId],
                ['quantity' => 0]
            );
            $targetInv->quantity += $request->quantity;
            $targetInv->save();

            // Bersihkan data jika 0 (agar database tidak penuh sampah)
            if ($sourceInv->quantity == 0) {
                $sourceInv->delete();
            }

            DB::commit();
            return back()->with('success', 'Barang berhasil dipindahkan!');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Gagal memindahkan barang: ' . $e->getMessage()]);
        }
    }

    public function deleteStorage(Storage $storage)
    {
        // 1. Pastikan yang menghapus adalah pemiliknya
        if ($storage->user_id !== auth()->id()) {
            abort(403, 'Anda tidak memiliki akses untuk menghapus tempat ini.');
        }

        DB::beginTransaction();
        try {
            // 2. Selamatkan barang: Ubah storage_id barang di dalamnya menjadi null (Mengambang)
            \App\Models\Inventory::where('storage_id', $storage->id)
                ->update(['storage_id' => null]);

            // 3. Hapus tempat/paketnya
            $storage->delete();

            DB::commit();
            return back()->with('success', 'Paket/Tempat berhasil dihapus. Semua isi barang dikembalikan ke Tas.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Gagal menghapus: ' . $e->getMessage()]);
        }
    }
}