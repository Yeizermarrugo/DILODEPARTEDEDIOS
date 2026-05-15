<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('devocional_categories')
            ->where('name', 'Propósito y carácter')
            ->update(['name' => 'Propósito y Carácter']);

        DB::table('devocional_categories')
            ->where('name', 'Dirección y guía')
            ->update(['name' => 'Dirección y Guía']);

        Cache::forget('devocional-categorias');
        Cache::forget('search-categorias-series');
        Cache::forget('devocional-autores');
    }

    public function down(): void
    {
        DB::table('devocional_categories')
            ->where('name', 'Propósito y Carácter')
            ->update(['name' => 'Propósito y carácter']);

        DB::table('devocional_categories')
            ->where('name', 'Dirección y Guía')
            ->update(['name' => 'Dirección y guía']);

        Cache::forget('devocional-categorias');
        Cache::forget('search-categorias-series');
        Cache::forget('devocional-autores');
    }
};
