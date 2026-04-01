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
        Schema::create('storages', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Contoh: "Rancher Hitam", "Gudang Dillimore"
            $table->enum('type', ['vehicle', 'warehouse', 'safe'])->default('vehicle'); // Jenis penyimpanan
            $table->string('plate_number')->nullable(); // Plat nomor jika itu kendaraan
            $table->foreignId('pic_user_id')->nullable()->constrained('users')->onDelete('set null'); // Siapa yang pegang kunci/bertanggung jawab
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('storages');
    }
};
