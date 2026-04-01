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
        Schema::table('donations', function (Blueprint $table) {
            // Campos de Auditoría e Identificación Bancaria
            $table->string('bank_name')->nullable()->after('description');
            $table->string('receipt_number')->nullable()->after('bank_name'); // Código de aprobación
            $table->string('ip_address')->nullable()->after('receipt_number');
            $table->string('customer_phone')->nullable()->after('customer_email');

            // Indexamos el transaction_id para búsquedas rápidas en auditoría
            $table->index('transaction_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('donations', function (Blueprint $table) {
            $table->dropIndex(['transaction_id']);
            $table->dropColumn([
                'bank_name',
                'receipt_number',
                'ip_address',
                'customer_phone'
            ]);
        });
    }
};