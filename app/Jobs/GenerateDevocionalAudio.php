<?php

namespace App\Jobs;

use App\Models\Devocional;
use App\Services\TextToSpeechService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class GenerateDevocionalAudio implements ShouldQueue
{
    use Queueable;

    public int $tries = 2;

    public int $timeout = 180;

    public function __construct(private string $devocionalId) {}

    public function handle(TextToSpeechService $tts): void
    {
        $devocional = Devocional::find($this->devocionalId);

        if (! $devocional || $devocional->hidden) {
            return;
        }

        if ($tts->plainTextFromHtml($devocional->contenido ?? '') === '') {
            return;
        }

        try {
            $lock = Cache::lock("dilodepartededios:tts:devocional:{$devocional->id}", 180);

            $lock->block(5, function () use ($tts, $devocional) {
                $url = $tts->generateFromHtml($devocional->contenido ?? '');

                Cache::put(
                    "dilodepartededios:tts:devocional:{$devocional->id}:url",
                    $url,
                    now()->addDays(30)
                );

                Log::info('Devocional audio pregenerated', [
                    'id' => $devocional->id,
                    'url' => $url,
                ]);
            });
        } catch (\Throwable $exception) {
            Log::warning('Devocional audio pregeneration failed', [
                'id' => $devocional->id,
                'message' => $exception->getMessage(),
            ]);
        }
    }
}
