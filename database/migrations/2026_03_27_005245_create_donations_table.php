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
        Schema::create('donations', function (Blueprint $table) {
            $table->id();
            $table->string('ref_payco')->unique(); // Referencia interna de ePayco
            $table->string('transaction_id')->nullable(); // ID de la transacción
            $table->decimal('amount', 15, 2);
            $table->string('currency', 3);
            $table->string('status'); // Aceptada, Rechazada, Pendiente
            $table->string('description')->nullable();
            $table->string('customer_name')->nullable();
            $table->string('customer_email')->nullable();
            $table->json('raw_response')->nullable(); // Guardamos todo por si hay reclamos
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('donations');
    }
};