<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $now = now();

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
                    ['created_at' => $now, 'updated_at' => $now]
                );
            });

        if (DB::connection()->getDriverName() !== 'mysql') {
            return;
        }

        if (Schema::hasIndex('devocionals', 'idx_dev_categoria')) {
            DB::statement('ALTER TABLE devocionals DROP INDEX idx_dev_categoria');
        }

        DB::statement('ALTER TABLE devocionals MODIFY categoria VARCHAR(255) NOT NULL');

        if (! Schema::hasIndex('devocionals', 'devocionals_categoria_foreign')) {
            DB::statement('ALTER TABLE devocionals ADD INDEX devocionals_categoria_foreign (categoria)');
        }

        DB::statement(
            'ALTER TABLE devocionals ADD CONSTRAINT devocionals_categoria_foreign FOREIGN KEY (categoria) REFERENCES devocional_categories(name) ON UPDATE CASCADE ON DELETE RESTRICT'
        );
    }

    public function down(): void
    {
        if (DB::connection()->getDriverName() !== 'mysql') {
            return;
        }

        DB::statement('ALTER TABLE devocionals DROP FOREIGN KEY devocionals_categoria_foreign');
        DB::statement('ALTER TABLE devocionals DROP INDEX devocionals_categoria_foreign');
        DB::statement('ALTER TABLE devocionals MODIFY categoria TEXT NOT NULL');

        if (! Schema::hasIndex('devocionals', 'idx_dev_categoria')) {
            DB::statement('ALTER TABLE devocionals ADD INDEX idx_dev_categoria (categoria(100))');
        }
    }
};
