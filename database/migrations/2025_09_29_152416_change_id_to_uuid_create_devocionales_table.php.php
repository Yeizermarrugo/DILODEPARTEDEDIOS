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
    public function up()
    {
        // Cambia tipo de columna
        Schema::table('devocionals', function (Blueprint $table) {
            $table->string('id', 36)->change();
        });

        // Asigna UUID únicos
        $devocionals = DB::table('devocionals')->get();
        foreach ($devocionals as $devocional) {
            DB::table('devocionals')
                ->where('id', $devocional->id)
                ->update(['id' => (string) Str::uuid()]);
        }
    }

    public function down()
    {
        Schema::table('devocionals', function (Blueprint $table) {
            $table->bigIncrements('id')->change();
        });
    }
};
