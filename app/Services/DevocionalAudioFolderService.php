<?php

namespace App\Services;

use App\Models\Devocional;
use Illuminate\Support\Facades\DB;

class DevocionalAudioFolderService
{
    /** @var array<int, int> Month (1-12) => number of slots, mirrors the calendar (non-leap February). */
    public const MONTH_CAPACITIES = [
        1 => 31, 2 => 28, 3 => 31, 4 => 30, 5 => 31, 6 => 30,
        7 => 31, 8 => 31, 9 => 30, 10 => 31, 11 => 30, 12 => 31,
    ];

    /** @var array<int, string> */
    public const MONTH_NAMES = [
        1 => 'Enero', 2 => 'Febrero', 3 => 'Marzo', 4 => 'Abril', 5 => 'Mayo', 6 => 'Junio',
        7 => 'Julio', 8 => 'Agosto', 9 => 'Septiembre', 10 => 'Octubre', 11 => 'Noviembre', 12 => 'Diciembre',
    ];

    /** @return array<int, int> month => assigned count */
    public function counts(): array
    {
        return Devocional::soloDevocionales()
            ->whereNotNull('audio_folder_month')
            ->selectRaw('audio_folder_month, count(*) as total')
            ->groupBy('audio_folder_month')
            ->pluck('total', 'audio_folder_month')
            ->all();
    }

    /**
     * One-time backfill: assigns every unassigned devocional to the next open
     * slot, filling January first, then February, etc. Safe to call again —
     * it only ever touches rows that still have no folder.
     */
    public function fillGaps(): int
    {
        $assigned = 0;

        DB::transaction(function () use (&$assigned) {
            $counts = Devocional::soloDevocionales()
                ->whereNotNull('audio_folder_month')
                ->selectRaw('audio_folder_month, count(*) as total')
                ->groupBy('audio_folder_month')
                ->lockForUpdate()
                ->pluck('total', 'audio_folder_month');

            $pool = Devocional::soloDevocionales()
                ->whereNull('audio_folder_month')
                ->inRandomOrder()
                ->pluck('id')
                ->all();

            foreach (self::MONTH_CAPACITIES as $month => $capacity) {
                $current = (int) ($counts[$month] ?? 0);
                $remaining = $capacity - $current;

                if ($remaining <= 0 || empty($pool)) {
                    continue;
                }

                $slice = array_splice($pool, 0, $remaining);
                $position = $current;

                foreach ($slice as $id) {
                    $position++;
                    Devocional::where('id', $id)->update([
                        'audio_folder_month' => $month,
                        'audio_folder_position' => $position,
                    ]);
                    $assigned++;
                }
            }
        });

        return $assigned;
    }

    /**
     * Appends a single freshly-created devocional to the next open slot
     * (January first, then February, ...). Called automatically on create
     * so new content keeps filling the calendar without re-running fillGaps().
     */
    public function assignNext(Devocional $devocional): void
    {
        if ($devocional->audio_folder_month !== null) {
            return;
        }

        DB::transaction(function () use ($devocional) {
            $counts = Devocional::soloDevocionales()
                ->whereNotNull('audio_folder_month')
                ->selectRaw('audio_folder_month, count(*) as total')
                ->groupBy('audio_folder_month')
                ->lockForUpdate()
                ->pluck('total', 'audio_folder_month');

            foreach (self::MONTH_CAPACITIES as $month => $capacity) {
                $current = (int) ($counts[$month] ?? 0);

                if ($current < $capacity) {
                    $devocional->forceFill([
                        'audio_folder_month' => $month,
                        'audio_folder_position' => $current + 1,
                    ])->save();

                    return;
                }
            }
            // All 12 folders full (365 reached) — leave unassigned.
        });
    }

    /**
     * Moves a devocional to a different month folder, appended at the end.
     * Closes the gap left behind in its previous month, if any.
     *
     * @throws \RuntimeException if the target folder is already full
     */
    public function move(Devocional $devocional, int $targetMonth): void
    {
        if (! array_key_exists($targetMonth, self::MONTH_CAPACITIES)) {
            throw new \InvalidArgumentException('Mes inválido.');
        }

        DB::transaction(function () use ($devocional, $targetMonth) {
            $oldMonth = $devocional->audio_folder_month;
            $oldPosition = $devocional->audio_folder_position;

            if ($oldMonth === $targetMonth) {
                return;
            }

            $targetCount = Devocional::soloDevocionales()
                ->where('audio_folder_month', $targetMonth)
                ->lockForUpdate()
                ->count();

            if ($targetCount >= self::MONTH_CAPACITIES[$targetMonth]) {
                throw new \RuntimeException('La carpeta destino ya está completa.');
            }

            // Vacate the old slot first so the gap-closing shift below never
            // collides with the (month, position) unique constraint.
            $devocional->forceFill([
                'audio_folder_month' => $targetMonth,
                'audio_folder_position' => $targetCount + 1,
            ])->save();

            if ($oldMonth === null) {
                return;
            }

            $trailing = Devocional::soloDevocionales()
                ->where('audio_folder_month', $oldMonth)
                ->where('audio_folder_position', '>', $oldPosition)
                ->orderBy('audio_folder_position')
                ->get(['id', 'audio_folder_position']);

            foreach ($trailing as $row) {
                Devocional::where('id', $row->id)->update([
                    'audio_folder_position' => $row->audio_folder_position - 1,
                ]);
            }
        });
    }
}
