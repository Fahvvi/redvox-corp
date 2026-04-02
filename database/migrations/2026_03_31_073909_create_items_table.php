<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::create('items', function (Blueprint $table) {
        $table->id();
        $table->string('name');
        $table->string('category'); // Logam, Kayu, Elektronik, dll
        $table->decimal('buy_price', 15, 2)->default(0); // Harga beli dari warga
        $table->decimal('sell_price', 15, 2)->default(0); // Harga jual ke pengepul/pembeli
        $table->string('image_url')->nullable(); // Untuk foto barang di E-commerce
        $table->string('unit')->default('pcs'); // pcs, kg, slot
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('items');
    }
};
