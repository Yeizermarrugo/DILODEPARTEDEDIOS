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

    public int $tries = 3;

    public int $timeout = 900;

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
            $lock = Cache::lock("dilodepartededios:tts:devocional:{$devocional->id}", 900);

            $lock->block(5, function () use ($tts, $devocional) {
                foreach ($tts->voicePairs() as $voicePair) {
                    try {
                        $existing = $tts->cachedFromHtmlWithTimings(
                            $devocional->contenido ?? '',
                            $voicePair['lang'],
                            $voicePair['voice'],
                        );

                        if ($existing !== null) {
                            Log::info('Devocional audio already exists; skipped pregeneration', [
                                'id' => $devocional->id,
                                'lang' => $voicePair['lang'],
                                'voice' => $voicePair['voice'],
                            ]);

                            continue;
                        }

                        $payload = $tts->generateFromHtmlWithTimings(
                            $devocional->contenido ?? '',
                            $voicePair['lang'],
                            $voicePair['voice'],
                        );

                        Cache::put(
                            "dilodepartededios:tts:devocional:{$devocional->id}:{$voicePair['lang']}:{$voicePair['voice']}:url",
                            $payload['url'],
                            now()->addDays(30)
                        );

                        Log::info('Devocional audio pregenerated', [
                            'id' => $devocional->id,
                            'lang' => $voicePair['lang'],
                            'voice' => $voicePair['voice'],
                            'url' => $payload['url'],
                            'has_timings' => $payload['timings'] !== null,
                        ]);
                    } catch (\Throwable $exception) {
                        Log::warning('Devocional audio voice pregeneration failed', [
                            'id' => $devocional->id,
                            'lang' => $voicePair['lang'],
                            'voice' => $voicePair['voice'],
                            'message' => $exception->getMessage(),
                        ]);
                    }
                }
            });
        } catch (\Throwable $exception) {
            Log::warning('Devocional audio pregeneration failed', [
                'id' => $devocional->id,
                'message' => $exception->getMessage(),
            ]);
        }
    }
}
