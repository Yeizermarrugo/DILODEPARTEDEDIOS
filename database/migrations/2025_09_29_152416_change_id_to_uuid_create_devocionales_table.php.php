<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Cambia el tipo de columna id a CHAR(36)
        DB::statement('ALTER TABLE devocionals MODIFY id CHAR(36);');

        // 2. Asigna UUID únicos a cada fila existente
        $devocionals = DB::table('devocionals')->get();
        foreach ($devocionals as $devocional) {
            DB::table('devocionals')
                ->where('id', $devocional->id)
                ->update(['id' => (string) Str::uuid()]);
        }

        // 3. Elimina la primary key si existe
        try {
            DB::statement('ALTER TABLE devocionals DROP PRIMARY KEY;');
        } catch (\Exception $e) {
            // Ignora si no existe
        }

        // 4. Agrega la primary key al campo id
        DB::statement('ALTER TABLE devocionals ADD PRIMARY KEY (id);');
    }

    public function down()
    {
        // Eliminar la primary key y convertir el campo id a BIGINT auto_increment
        DB::statement('ALTER TABLE devocionals DROP PRIMARY KEY;');
        DB::statement('ALTER TABLE devocionals MODIFY id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT;');
        DB::statement('ALTER TABLE devocionals ADD PRIMARY KEY (id);');
    }
};
