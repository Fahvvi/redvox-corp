<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventories', function (Blueprint $table) {
            $table->id();
            // 1. Tambahkan Pemilik Barang
            $table->foreignId('user_id')->constrained()->cascadeOnDelete(); 
            
            // 2. Buat storage_id menjadi nullable() (Jika null = Barang ada di Tas/Mengambang)
            $table->foreignId('storage_id')->nullable()->constrained()->cascadeOnDelete(); 
            
            $table->foreignId('item_id')->constrained()->cascadeOnDelete();
            $table->integer('quantity')->default(0);
            $table->timestamps();

            // 3. Aturan Unik Baru: Di 1 tempat, 1 user hanya punya 1 tumpukan (stack) barang yang sama
            $table->unique(['user_id', 'storage_id', 'item_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventories');
    }
};