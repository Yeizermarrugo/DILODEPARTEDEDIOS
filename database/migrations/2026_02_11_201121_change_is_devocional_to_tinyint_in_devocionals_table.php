<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('devocionals', function (Blueprint $table) {
            // permite 0,1,2
            $table->unsignedTinyInteger('is_devocional')
                  ->default(1)
                  ->change();
        });
    }

    public function down(): void
    {
        Schema::table('devocionals', function (Blueprint $table) {
            $table->boolean('is_devocional')
                  ->default(true)
                  ->change();
        });
    }
};