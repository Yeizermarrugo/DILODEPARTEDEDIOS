<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('content_likes', function (Blueprint $table) {
            $table->id();
            $table->string('content_id');        // UUID del devocional/estudio/ensenanza
            $table->string('content_type', 50);  // 'devocional' | 'estudio' | 'ensenanza'
            $table->string('visitor_hash', 64);  // SHA256(uuid|content_id|content_type)
            $table->string('ip_segment', 45)->nullable(); // solo auditoría
            $table->timestamp('created_at')->useCurrent();

            // Un visitante solo puede dar like UNA VEZ por contenido
            $table->unique(['content_id', 'content_type', 'visitor_hash'], 'unique_like');

            // Índice para los conteos rápidos
            $table->index(['content_id', 'content_type'], 'idx_content');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('content_likes');
    }
};