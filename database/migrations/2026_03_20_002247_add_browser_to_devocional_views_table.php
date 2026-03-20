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
        Schema::table('devocional_views', function (Blueprint $table) {
            // Cambiamos 'platform' para que sea más específico y añadimos 'browser'
            $table->string('browser')->after('country')->nullable(); // Ej: Chrome
            $table->string('platform')->change(); // Para asegurar que acepte strings cortos: Ej: Windows
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('devocional_views', function (Blueprint $table) {
            //
        });
    }
};