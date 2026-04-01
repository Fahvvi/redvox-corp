<?php

namespace App\Http\Controllers;

use App\Models\Deposit;
use App\Models\Inventory;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        // 1. Hitung Total Deposit
        $totalDeposit = Deposit::sum('balance') ?? 0;

        // 2. Hitung Total Inventaris
        $totalInventory = Inventory::sum('quantity') ?? 0;

        // 3. Hitung Estimasi Aset (Barang di Gudang x Harga Beli)
        $inventoryValue = 0;
        $inventories = Inventory::with('item')->get();
        foreach ($inventories as $inv) {
            if ($inv->item) {
                $inventoryValue += ($inv->quantity * $inv->item->buy_price);
            }
        }

        return Inertia::render('Dashboard', [
            // Kirim data ke React dalam bentuk array 'stats'
            'stats' => [
                'total_deposit' => $totalDeposit,
                'total_inventory' => $totalInventory,
                'company_cash' => $inventoryValue,
            ]
        ]);
    }
}