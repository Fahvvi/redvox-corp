<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('storages', function (Blueprint $table) {
            $table->id();
            
            // 1. Tambahkan pemilik Gudang/Kendaraan/Paket
            $table->foreignId('user_id')->nullable()->constrained('users')->cascadeOnDelete(); 
            
            $table->string('name'); // Nama Tempat (Gudang Flint / Benson Hitam / Paket Mafia)
            $table->string('type'); // Tipe: 'warehouse', 'vehicle', 'package'
            
            // 2. Kolom tambahan untuk detail kendaraan & paket
            $table->string('vehicle_id')->nullable(); // Plat Nomor / ID Kendaraan
            $table->string('location_detail')->nullable(); // Koordinat lokasi
            $table->string('package_type')->nullable(); // 'furniture', 'restoran', 'mafia'
            
            $table->integer('capacity')->default(5000);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('storages');
    }
};