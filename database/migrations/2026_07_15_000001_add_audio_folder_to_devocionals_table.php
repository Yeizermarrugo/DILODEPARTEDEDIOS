<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('devocionals', function (Blueprint $table) {
            $table->unsignedTinyInteger('audio_folder_month')->nullable()->after('shares_count');
            $table->unsignedTinyInteger('audio_folder_position')->nullable()->after('audio_folder_month');
            $table->unique(['audio_folder_month', 'audio_folder_position'], 'devocionals_audio_folder_slot_unique');
            $table->index(['is_devocional', 'audio_folder_month'], 'devocionals_audio_folder_month_idx');
        });
    }

    public function down(): void
    {
        Schema::table('devocionals', function (Blueprint $table) {
            $table->dropUnique('devocionals_audio_folder_slot_unique');
            $table->dropIndex('devocionals_audio_folder_month_idx');
            $table->dropColumn(['audio_folder_month', 'audio_folder_position']);
        });
    }
};
