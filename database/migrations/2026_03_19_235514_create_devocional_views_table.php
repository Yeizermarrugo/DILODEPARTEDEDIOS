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
       Schema::create('devocional_views', function (Blueprint $table) {
        $table->id();
        $table->uuid('devocional_id'); // Usamos UUID por tu modelo
        $table->foreign('devocional_id')->references('id')->on('devocionals')->onDelete('cascade');
        $table->string('ip_address', 45);
        $table->string('country')->nullable();
        $table->string('platform')->nullable();
        $table->timestamps(); // Esto nos da la fecha y hora exacta
        
        $table->index(['devocional_id', 'ip_address', 'created_at']);
    });

    // Añadimos el contador rápido a la tabla principal
    Schema::table('devocionals', function (Blueprint $table) {
        $table->unsignedBigInteger('views_count')->default(0);
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('devocional_views');
    }
};