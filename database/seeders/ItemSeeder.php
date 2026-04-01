<?php

namespace Database\Seeders;

use App\Models\Item;
use Illuminate\Database\Seeder;

class ItemSeeder extends Seeder
{
    public function run(): void
    {
        $items = [
            // KEHUTANAN
            ['name' => 'Kayu Gelondong', 'category' => 'Kehutanan', 'buy_price' => 22, 'sell_price' => 35],
            ['name' => 'Getah (Sap)', 'category' => 'Kehutanan', 'buy_price' => 25, 'sell_price' => 40],
            ['name' => 'Kayu Halus', 'category' => 'Kehutanan', 'buy_price' => 95, 'sell_price' => 120],
            ['name' => 'Lem Kayu', 'category' => 'Kehutanan', 'buy_price' => 75, 'sell_price' => 95],

            // PERTAMBANGAN
            ['name' => 'Batu (Stone)', 'category' => 'Pertambangan', 'buy_price' => 20, 'sell_price' => 135],
            ['name' => 'Biji Perak', 'category' => 'Pertambangan', 'buy_price' => 20, 'sell_price' => null],
            ['name' => 'Biji Tembaga', 'category' => 'Pertambangan', 'buy_price' => 30, 'sell_price' => null],
            ['name' => 'Biji Belerang', 'category' => 'Pertambangan', 'buy_price' => 35, 'sell_price' => null],
            ['name' => 'Biji Emas', 'category' => 'Pertambangan', 'buy_price' => 80, 'sell_price' => null],
            ['name' => 'Biji Berlian', 'category' => 'Pertambangan', 'buy_price' => 95, 'sell_price' => null],
            ['name' => 'Batang Perak', 'category' => 'Pertambangan', 'buy_price' => 450, 'sell_price' => 600],
            ['name' => 'Batang Tembaga', 'category' => 'Pertambangan', 'buy_price' => 450, 'sell_price' => 600],
            ['name' => 'Batang Berlian', 'category' => 'Pertambangan', 'buy_price' => 450, 'sell_price' => 600],
            ['name' => 'Serbuk Belerang', 'category' => 'Pertambangan', 'buy_price' => 450, 'sell_price' => 600],
            ['name' => 'Batang Emas', 'category' => 'Pertambangan', 'buy_price' => 1250, 'sell_price' => 1650],

            // MINYAK & ENERGI
            ['name' => 'Minyak Bumi', 'category' => 'Minyak', 'buy_price' => 35, 'sell_price' => null],
            ['name' => 'Bensin', 'category' => 'Minyak', 'buy_price' => 230, 'sell_price' => 300],
            ['name' => 'Solar', 'category' => 'Minyak', 'buy_price' => 230, 'sell_price' => 300],
            ['name' => 'Disel', 'category' => 'Minyak', 'buy_price' => 230, 'sell_price' => 300],
            ['name' => 'Avtur', 'category' => 'Minyak', 'buy_price' => 460, 'sell_price' => 580],

            // PERTANIAN & PETERNAKAN
            ['name' => 'Bulu', 'category' => 'Pangan', 'buy_price' => 100, 'sell_price' => 125],
            ['name' => 'Daging Mentah', 'category' => 'Pangan', 'buy_price' => 350, 'sell_price' => 425],
            ['name' => 'Ayam Mentah', 'category' => 'Pangan', 'buy_price' => 100, 'sell_price' => 125],
            ['name' => 'Susu Sapi', 'category' => 'Pangan', 'buy_price' => 60, 'sell_price' => 115],
            ['name' => 'Telur', 'category' => 'Pangan', 'buy_price' => 50, 'sell_price' => 115],
            ['name' => 'Beras', 'category' => 'Pangan', 'buy_price' => 50, 'sell_price' => 115],
            ['name' => 'Kopi', 'category' => 'Pangan', 'buy_price' => 50, 'sell_price' => 115],
            ['name' => 'Teh Celup', 'category' => 'Pangan', 'buy_price' => 50, 'sell_price' => 115],
            ['name' => 'Garam', 'category' => 'Pangan', 'buy_price' => 50, 'sell_price' => null],
            ['name' => 'Gula', 'category' => 'Pangan', 'buy_price' => 50, 'sell_price' => null],
        
        
            // JAHIT
            ['name' => 'Benang', 'category' => 'Jahit', 'buy_price' => 95, 'sell_price' => 35],
            ['name' => 'Kain', 'category' => 'Jahit', 'buy_price' => 400, 'sell_price' => 75],
            ['name' => 'Pakaian', 'category' => 'Jahit', 'buy_price' => 1200, 'sell_price' => 25],
        
            ];

        foreach ($items as $item) {
            Item::create($item);
        }
    }
}