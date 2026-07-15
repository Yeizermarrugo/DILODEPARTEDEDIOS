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

    public function __construct(
        private string $devocionalId,
        private ?string $priorityLang = null,
        private ?string $priorityVoice = null,
    ) {}

    public static function inProgressCacheKey(string $devocionalId): string
    {
        return "dilodepartededios:tts:devocional:{$devocionalId}:generating";
    }

    /**
     * Dispatch a pregeneration job unless one is already queued/running for this devocional.
     * Reserves the in-progress flag atomically at dispatch time (not job-start time) so two
     * dispatches racing while the first job is still sitting in the queue can't both get through.
     *
     * When $priorityLang/$priorityVoice are given (e.g. the voice a visitor is actively
     * waiting on from the Play button), that pair is generated first instead of following
     * the fixed voicePairs() order — otherwise a visitor waiting on the last voice in that
     * list has to wait for all the others to finish (or time out/retry) first.
     */
    public static function dispatchIfNotInProgress(
        string $devocionalId,
        ?string $priorityLang = null,
        ?string $priorityVoice = null,
    ): void {
        $reserved = Cache::add(self::inProgressCacheKey($devocionalId), true, 900);

        if (! $reserved) {
            return;
        }

        self::dispatch($devocionalId, $priorityLang, $priorityVoice)->afterCommit();
    }

    public function handle(TextToSpeechService $tts): void
    {
        $devocional = Devocional::find($this->devocionalId);

        if (! $devocional || $devocional->hidden) {
            return;
        }

        if ($tts->plainTextFromHtml($devocional->contenido ?? '') === '') {
            return;
        }

        $inProgressKey = self::inProgressCacheKey($devocional->id);
        // Refresh/reserve the flag in case this job was dispatched directly
        // (bypassing dispatchIfNotInProgress, e.g. the --sync CLI backfill path).
        Cache::put($inProgressKey, true, $this->timeout);

        try {
            $lock = Cache::lock("dilodepartededios:tts:devocional:{$devocional->id}", 900);

            $lock->block(5, function () use ($tts, $devocional) {
                foreach ($this->orderedVoicePairs($tts) as $voicePair) {
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
        } finally {
            Cache::forget($inProgressKey);
        }
    }

    /**
     * @return array<int, array{lang: string, voice: string, label: string}>
     */
    private function orderedVoicePairs(TextToSpeechService $tts): array
    {
        $voicePairs = $tts->voicePairs();

        if ($this->priorityLang === null || $this->priorityVoice === null) {
            return $voicePairs;
        }

        $isPriority = fn (array $pair) => $pair['lang'] === $this->priorityLang && $pair['voice'] === $this->priorityVoice;

        $priority = array_values(array_filter($voicePairs, $isPriority));
        $rest = array_values(array_filter($voicePairs, fn (array $pair) => ! $isPriority($pair)));

        return [...$priority, ...$rest];
    }
}
