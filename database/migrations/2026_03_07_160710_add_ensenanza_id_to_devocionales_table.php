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
       Schema::table('devocionals', function (Blueprint $table) {
            $table->unsignedBigInteger('ensenanza_id')->nullable()->after('id');

            $table->foreign('ensenanza_id')
                  ->references('id')->on('ensenanzas')
                  ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
          Schema::table('devocionals', function (Blueprint $table) {
            $table->dropForeign(['ensenanza_id']);
            $table->dropColumn('ensenanza_id');
        });
    }
};