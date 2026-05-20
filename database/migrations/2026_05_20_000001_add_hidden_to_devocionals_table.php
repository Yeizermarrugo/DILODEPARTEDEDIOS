<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('devocionals', function (Blueprint $table) {
            $table->boolean('hidden')->default(false)->after('is_devocional');
            $table->index('hidden');
        });

        // Backfill: hidden serie episodes had ensenanza_id set → restore type 2
        DB::statement("UPDATE devocionals SET hidden = 1, is_devocional = 2 WHERE is_devocional = 0 AND ensenanza_id IS NOT NULL");
        // Backfill: all other hidden items (is_devocional=0, no ensenanza_id) were devocionals
        DB::statement("UPDATE devocionals SET hidden = 1, is_devocional = 1 WHERE is_devocional = 0 AND ensenanza_id IS NULL");
    }

    public function down(): void
    {
        // Revert: restore is_devocional = 0 for hidden rows
        DB::statement("UPDATE devocionals SET is_devocional = 0 WHERE hidden = 1");

        Schema::table('devocionals', function (Blueprint $table) {
            $table->dropIndex(['hidden']);
            $table->dropColumn('hidden');
        });
    }
};
