<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('devocional_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        $now = now();
        DB::table('devocional_categories')->insert([
            [
                'name' => 'Amor',
                'description' => 'Devocionales sobre el amor de Dios, su misericordia, perdón y salvación en Jesucristo. Aquí encontrarás mensajes que te ayudarán a comprender cuánto te ama Dios y cómo su gracia puede transformar tu vida.',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Mayordomía',
                'description' => 'Devocionales sobre la correcta administración de los recursos, dones y bendiciones que Dios nos entrega. Aquí encontrarás principios bíblicos para honrar a Dios y aprender a cuidar lo que ha puesto en tus manos.',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Relaciones',
                'description' => 'Devocionales sobre la forma en que debemos relacionarnos con los demás según el ejemplo de Jesús. Aquí encontrarás temas de familia, amistad, matrimonio, perdón y reconciliación para fortalecer tus relaciones.',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Fe',
                'description' => 'Devocionales enfocados en confiar en Dios, creer en sus promesas y permanecer firmes en medio de las pruebas. Aquí encontrarás palabras que fortalecerán tu confianza y dependencia de Dios.',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Dirección y Guía',
                'description' => 'Devocionales para quienes necesitan dirección, sabiduría y guía de Dios en diferentes áreas de su vida. Aquí encontrarás respuestas y principios bíblicos para tomar decisiones con sabiduría.',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Propósito y Carácter',
                'description' => 'Devocionales que te ayudarán a comprender tu identidad en Cristo y el propósito para el cual Dios te creó. Aquí encontrarás mensajes para crecer espiritualmente y desarrollar un carácter conforme a Dios.',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Oración',
                'description' => 'Devocionales enfocados en fortalecer la intimidad y comunicación con Dios a través de la oración. Aquí encontrarás inspiración y guía para desarrollar una vida espiritual más cercana a Dios.',
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);

        DB::table('devocionals')
            ->whereNotNull('categoria')
            ->where('categoria', '!=', '')
            ->select('categoria')
            ->distinct()
            ->orderBy('categoria')
            ->get()
            ->each(function ($row) use ($now) {
                DB::table('devocional_categories')->updateOrInsert(
                    ['name' => $row->categoria],
                    ['updated_at' => $now, 'created_at' => $now]
                );
            });
    }

    public function down(): void
    {
        Schema::dropIfExists('devocional_categories');
    }
};