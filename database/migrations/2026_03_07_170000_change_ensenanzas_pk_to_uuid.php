<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        // 1) Quitar FK y columna en devocionals (para evitar incompatibilidad)
        Schema::table('devocionals', function (Blueprint $table) {
            // Solo si ya existe la FK/columna; si da error al dropear, coméntalo y lo hacemos manual
            if (Schema::hasColumn('devocionals', 'ensenanza_id')) {
                $table->dropForeign(['ensenanza_id']);
                $table->dropColumn('ensenanza_id');
            }
        });

        // 2) Cambiar id de ensenanzas a string(36)
        Schema::table('ensenanzas', function (Blueprint $table) {
            $table->string('id', 36)->change();
        });

        // 3) Asignar UUID a cada fila existente
        $rows = DB::table('ensenanzas')->get();
        foreach ($rows as $row) {
            DB::table('ensenanzas')
                ->where('id', $row->id)
                ->update(['id' => (string) Str::uuid()]);
        }

        // 4) Volver a crear ensenanza_id en devocionals como string(36) con FK
        Schema::table('devocionals', function (Blueprint $table) {
            $table->string('ensenanza_id', 36)->nullable()->after('id');

            $table->foreign('ensenanza_id')
                  ->references('id')->on('ensenanzas')
                  ->nullOnDelete();
        });
    }

    public function down(): void
    {
          Schema::table('devocionals', function (Blueprint $table) {
            $table->dropForeign(['ensenanza_id']);
            $table->dropColumn('ensenanza_id');
        });
    }
};