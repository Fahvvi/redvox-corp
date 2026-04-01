<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Akun Super Admin (Fico Alneri)
        User::updateOrCreate(
            ['email' => 'fico@redvox.com'], // Mencegah duplikasi jika di-seed ulang
            [
                'name' => 'Fico Alneri',
                'password' => Hash::make('password123'), // Silakan ganti passwordnya nanti
                'role' => 'admin',
            ]
        );

        // 2. Akun Test Investor / Warga Biasa
        User::updateOrCreate(
            ['email' => 'warga@los-santos.com'],
            [
                'name' => 'Warga Los Santos',
                'password' => Hash::make('password123'),
                'role' => 'user',
            ]
        );

        // Jangan lupa panggil seeder barang yang kemarin kita buat
        $this->call([
            ItemSeeder::class,
        ]);
    }
}
