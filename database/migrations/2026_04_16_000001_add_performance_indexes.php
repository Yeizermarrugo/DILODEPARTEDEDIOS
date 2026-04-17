<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Helper: skip if index already exists (idempotent)
        $hasIndex = fn(string $table, string $index) => collect(
            DB::select("SHOW INDEX FROM `{$table}` WHERE Key_name = ?", [$index])
        )->isNotEmpty();

        Schema::table('devocionals', function (Blueprint $table) use ($hasIndex) {
            if (!$hasIndex('devocionals', 'idx_dev_filter_sort')) {
                $table->index(['is_devocional', 'ensenanza_id', 'created_at'], 'idx_dev_filter_sort');
            }
            if (!$hasIndex('devocionals', 'idx_dev_views_count')) {
                $table->index('views_count', 'idx_dev_views_count');
            }
        });

        if (!$hasIndex('devocionals', 'idx_dev_categoria')) {
            DB::statement('ALTER TABLE devocionals ADD INDEX idx_dev_categoria (categoria(100))');
        }
        if (!$hasIndex('devocionals', 'idx_dev_autor')) {
            DB::statement('ALTER TABLE devocionals ADD INDEX idx_dev_autor (autor(100))');
        }

        Schema::table('content_likes', function (Blueprint $table) use ($hasIndex) {
            if (!$hasIndex('content_likes', 'idx_likes_content')) {
                $table->index(['content_type', 'content_id'], 'idx_likes_content');
            }
        });

        Schema::table('donations', function (Blueprint $table) use ($hasIndex) {
            if (!$hasIndex('donations', 'idx_donations_ref_payco')) {
                $table->index('ref_payco', 'idx_donations_ref_payco');
            }
            if (!$hasIndex('donations', 'idx_donations_transaction_id')) {
                $table->index('transaction_id', 'idx_donations_transaction_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('devocionals', function (Blueprint $table) {
            $table->dropIndex('idx_dev_filter_sort');
            $table->dropIndex('idx_dev_categoria');
            $table->dropIndex('idx_dev_autor');
            $table->dropIndex('idx_dev_views_count');
        });

        Schema::table('content_likes', function (Blueprint $table) {
            $table->dropIndex('idx_likes_content');
        });

        Schema::table('donations', function (Blueprint $table) {
            $table->dropIndex('idx_donations_ref_payco');
            $table->dropIndex('idx_donations_transaction_id');
        });
    }
};
