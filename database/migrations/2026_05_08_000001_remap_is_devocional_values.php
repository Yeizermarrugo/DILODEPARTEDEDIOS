<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Remap is_devocional values to a cleaner semantic:
 *   0 = Oculto  (hidden, any type)
 *   1 = Devocional
 *   2 = Serie/Enseñanza  (all have ensenanza_id)
 *   3 = Estudio Bíblico
 *
 * Previous mapping:
 *   0 = Estudio  →  migrate to 3
 *   1 = Devocional  →  no change
 *   2 + ensenanza_id  = Serie  →  no change (stays 2)
 *   2 + no ensenanza_id  = Oculto  →  migrate to 0
 *   1 + ensenanza_id  = Serie episode mis-tagged  →  migrate to 2
 */
return new class extends Migration
{
    public function up(): void
    {
        // 1. Estudios: 0 → 3
        DB::table('devocionals')
            ->where('is_devocional', 0)
            ->update(['is_devocional' => 3]);

        // 2. Series episodes mis-tagged as devocional: is_devocional=1 + ensenanza_id → 2
        DB::table('devocionals')
            ->where('is_devocional', 1)
            ->whereNotNull('ensenanza_id')
            ->where('ensenanza_id', '!=', '')
            ->update(['is_devocional' => 2]);

        // 3. Old "ocultos": is_devocional=2 without ensenanza_id → 0
        DB::table('devocionals')
            ->where('is_devocional', 2)
            ->where(function ($q) {
                $q->whereNull('ensenanza_id')->orWhere('ensenanza_id', '');
            })
            ->update(['is_devocional' => 0]);
    }

    public function down(): void
    {
        // 3 → 0 (estudios back)
        DB::table('devocionals')
            ->where('is_devocional', 3)
            ->update(['is_devocional' => 0]);

        // 2 (series with ensenanza_id) → 1 if they were originally mis-tagged
        // Note: this is lossy — we can't distinguish original 2 from migrated 1→2.
        // Best-effort: revert 2+ensenanza_id → 1 (assuming all were mis-tagged)
        DB::table('devocionals')
            ->where('is_devocional', 2)
            ->whereNotNull('ensenanza_id')
            ->where('ensenanza_id', '!=', '')
            ->update(['is_devocional' => 1]);

        // 0 (ocultos) → 2 (old hidden state)
        DB::table('devocionals')
            ->where('is_devocional', 0)
            ->update(['is_devocional' => 2]);
    }
};
