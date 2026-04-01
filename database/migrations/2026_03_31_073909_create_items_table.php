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
            $table->string('category'); // Contoh: Pertambangan, Kehutanan, Minyak
            $table->integer('buy_price')->default(0); // Harga beli Redvox
            $table->integer('sell_price')->nullable(); // Estimasi harga jual ke NPC
            $table->string('image_url')->nullable(); // Untuk foto barang di E-commerce
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
