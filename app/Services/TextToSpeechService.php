<?php

namespace App\Services;

use App\Traits\UsesStoragePrefix;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class TextToSpeechService
{
    use UsesStoragePrefix;

    private const CACHE_NAMESPACE = 'dilodepartededios:tts';

    /** @var array<string, array<string, string>> */
    private array $allowedVoices = [
        'es-CO' => [
            'es-CO-SalomeNeural' => 'Salomé (Colombia, femenino)',
            'es-CO-GonzaloNeural' => 'Gonzalo (Colombia, masculino)',
        ],
        'es-MX' => [
            'es-MX-DaliaNeural' => 'Dalia (México, femenino)',
            'es-MX-JorgeNeural' => 'Jorge (México, masculino)',
        ],
        'es-ES' => [
            'es-ES-ElviraNeural' => 'Elvira (España, femenino)',
            'es-ES-AlvaroNeural' => 'Álvaro (España, masculino)',
        ],
        'es-US' => [
            'es-US-PalomaNeural' => 'Paloma (EE. UU., femenino)',
            'es-US-AlonsoNeural' => 'Alonso (EE. UU., masculino)',
        ],
    ];

    /** @return array<int, array{label: string, value: string, available: bool}> */
    public function voices(string $lang = 'es-CO'): array
    {
        return collect($this->allowedVoices[$lang] ?? [])
            ->map(fn (string $label, string $voice) => [
                'label' => $label,
                'value' => $voice,
                'available' => true,
            ])
            ->values()
            ->all();
    }

    public function plainTextFromHtml(string $html): string
    {
        $text = strip_tags($html);
        $text = html_entity_decode($text, ENT_QUOTES | ENT_HTML5, 'UTF-8');

        return Str::of($text)->squish()->toString();
    }

    public function generate(
        string $text,
        string $lang = 'es-CO',
        string $voice = 'es-CO-SalomeNeural',
        int $rate = 0
    ): string {
        $apiKey = config('services.azure_speech.key');
        $region = config('services.azure_speech.region');
        $outputFormat = config('services.azure_speech.output_format');
        $cleanText = Str::of($text)->squish()->toString();

        if ($cleanText === '') {
            throw new \InvalidArgumentException('Texto requerido');
        }

        if (empty($apiKey) || empty($region)) {
            throw new \RuntimeException('Azure Speech no está configurado');
        }

        [$lang, $voice] = $this->normalizeVoice($lang, $voice);

        $rate = max(-50, min(100, $rate));
        $rateText = $rate === 0 ? 'default' : sprintf('%+d%%', $rate);
        $audioPath = $this->audioPath($cleanText, $lang, $voice, $rateText, $outputFormat);
        $cacheKey = $this->cacheKey($audioPath);

        try {
            if (Storage::disk('s3')->exists($audioPath)) {
                $url = Storage::disk('s3')->url($audioPath);
                Cache::put($cacheKey, $url, now()->addDays(30));

                return $url;
            }
        } catch (\Throwable $exception) {
            Log::warning('TTS cache existence check failed', [
                'path' => $audioPath,
                'message' => $exception->getMessage(),
            ]);
        }

        $lock = Cache::lock($this->lockKey($audioPath), 120);

        return $lock->block(10, function () use ($apiKey, $region, $outputFormat, $lang, $voice, $rateText, $cleanText, $audioPath, $cacheKey) {
            if (Storage::disk('s3')->exists($audioPath)) {
                $url = Storage::disk('s3')->url($audioPath);
                Cache::put($cacheKey, $url, now()->addDays(30));

                return $url;
            }

            $tokenResponse = $this->issueToken($apiKey, $region);
            $ssml = $this->buildSsml($lang, $voice, $rateText, $cleanText);
            $response = $this->synthesize($tokenResponse->body(), $region, $outputFormat, $ssml);

            if (! ($response->ok() && str_contains((string) $response->header('Content-Type'), 'audio'))) {
                Log::error('Azure Speech TTS error', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                throw new \RuntimeException('Error generando audio con Azure Speech');
            }

            $stored = Storage::disk('s3')->put($audioPath, $response->body(), [
                'visibility' => 'public',
                'CacheControl' => 'max-age=31536000, public',
                'ContentType' => 'audio/mpeg',
            ]);

            if (! $stored) {
                Log::error('Azure Speech audio storage error', ['path' => $audioPath]);

                throw new \RuntimeException('El audio se generó, pero no se pudo guardar en el bucket.');
            }

            $url = Storage::disk('s3')->url($audioPath);
            Cache::put($cacheKey, $url, now()->addDays(30));

            return $url;
        });
    }

    public function pathForText(
        string $text,
        string $lang = 'es-CO',
        string $voice = 'es-CO-SalomeNeural',
        int $rate = 0
    ): ?string {
        $cleanText = Str::of($text)->squish()->toString();
        if ($cleanText === '') {
            return null;
        }

        [$lang, $voice] = $this->normalizeVoice($lang, $voice);

        $rate = max(-50, min(100, $rate));
        $rateText = $rate === 0 ? 'default' : sprintf('%+d%%', $rate);

        return $this->audioPath($cleanText, $lang, $voice, $rateText, config('services.azure_speech.output_format'));
    }

    public function deleteForText(
        string $text,
        string $lang = 'es-CO',
        string $voice = 'es-CO-SalomeNeural',
        int $rate = 0
    ): void {
        $audioPath = $this->pathForText($text, $lang, $voice, $rate);
        if (! $audioPath) {
            return;
        }

        try {
            Storage::disk('s3')->delete($audioPath);
            Cache::forget($this->cacheKey($audioPath));
        } catch (\Throwable $exception) {
            Log::warning('TTS audio delete failed', [
                'path' => $audioPath,
                'message' => $exception->getMessage(),
            ]);
        }
    }

    /** @return array{0: string, 1: string} */
    private function normalizeVoice(string $lang, string $voice): array
    {
        $voicesForLang = $this->allowedVoices[$lang] ?? [];
        if (empty($voicesForLang)) {
            $lang = 'es-CO';
            $voicesForLang = $this->allowedVoices[$lang];
        }

        if (! array_key_exists($voice, $voicesForLang)) {
            $voice = array_key_first($voicesForLang) ?? 'es-CO-SalomeNeural';
        }

        return [$lang, $voice];
    }

    private function audioPath(string $text, string $lang, string $voice, string $rate, string $outputFormat): string
    {
        $ttsKey = md5('azure|'.$lang.'|'.$voice.'|'.$rate.'|'.$outputFormat.'|'.$text);

        return $this->storageFolder("tts/{$ttsKey}.mp3");
    }

    private function cacheKey(string $audioPath): string
    {
        return self::CACHE_NAMESPACE.':url:'.md5($audioPath);
    }

    private function lockKey(string $audioPath): string
    {
        return self::CACHE_NAMESPACE.':lock:'.md5($audioPath);
    }

    private function issueToken(string $apiKey, string $region): \Illuminate\Http\Client\Response
    {
        try {
            $response = Http::timeout(10)
                ->withHeaders(['Ocp-Apim-Subscription-Key' => $apiKey])
                ->post("https://{$region}.api.cognitive.microsoft.com/sts/v1.0/issuetoken");
        } catch (ConnectionException $exception) {
            Log::error('Azure Speech connection error', [
                'message' => $exception->getMessage(),
                'region' => $region,
            ]);

            throw new \RuntimeException('No se pudo conectar con Azure Speech.');
        }

        if (! $response->ok()) {
            Log::error('Azure Speech token error', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            throw new \RuntimeException('Error autenticando con Azure Speech');
        }

        return $response;
    }

    private function synthesize(string $token, string $region, string $outputFormat, string $ssml): \Illuminate\Http\Client\Response
    {
        try {
            return Http::timeout(30)
                ->withToken($token)
                ->withHeaders([
                    'Content-Type' => 'application/ssml+xml',
                    'X-Microsoft-OutputFormat' => $outputFormat,
                    'User-Agent' => config('app.name', 'Laravel'),
                ])
                ->withBody($ssml, 'application/ssml+xml')
                ->post("https://{$region}.tts.speech.microsoft.com/cognitiveservices/v1");
        } catch (ConnectionException $exception) {
            Log::error('Azure Speech synthesis connection error', [
                'message' => $exception->getMessage(),
                'region' => $region,
            ]);

            throw new \RuntimeException('No se pudo generar el audio porque el servidor no logró conectar con Azure Speech.');
        }
    }

    private function buildSsml(string $lang, string $voice, string $rate, string $text): string
    {
        $escapedText = e($text);

        return <<<SSML
<speak version="1.0" xml:lang="{$lang}" xmlns="http://www.w3.org/2001/10/synthesis">
    <voice name="{$voice}">
        <prosody rate="{$rate}">{$escapedText}</prosody>
    </voice>
</speak>
SSML;
    }
}
