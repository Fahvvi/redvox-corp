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
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_number')->unique(); // Contoh: INV-REDVOX-001
            $table->foreignId('cashier_id')->constrained('users'); // Kasir (Fico)
            $table->string('supplier_name'); // Nama warga In-Game (contoh: Ujang_Knalpot)
            $table->string('location')->nullable(); // Lokasi transaksi RP (contoh: Gudang Flint)
            $table->integer('total_amount'); // Total belanja (contoh: $15.000)
            $table->integer('deposit_deduction')->default(0); // Berapa yang diambil dari deposit
            $table->integer('cash_deduction')->default(0); // Berapa yang diambil dari uang cash Fico
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
