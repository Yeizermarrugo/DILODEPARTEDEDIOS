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
            $table->string('pdf')->nullable()->after('imagen');
            $table->string('instagram')->nullable()->after('pdf');
            $table->string('tiktok')->nullable()->after('instagram');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
          Schema::table('devocionals', function (Blueprint $table) {
            $table->dropColumn(['pdf', 'instagram', 'tiktok']);
        });
    }
};