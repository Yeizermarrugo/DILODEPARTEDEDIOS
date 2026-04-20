<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('devocionals', function (Blueprint $table) {
            $table->unsignedBigInteger('shares_count')->default(0)->after('short_code');
        });

        Schema::table('ensenanzas', function (Blueprint $table) {
            $table->unsignedBigInteger('shares_count')->default(0)->after('short_code');
        });
    }

    public function down(): void
    {
        Schema::table('devocionals', function (Blueprint $table) {
            $table->dropColumn('shares_count');
        });

        Schema::table('ensenanzas', function (Blueprint $table) {
            $table->dropColumn('shares_count');
        });
    }
};
