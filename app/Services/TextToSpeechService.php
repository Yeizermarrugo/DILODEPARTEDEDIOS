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

    private const BREAK_TOKEN_PREFIX = '[[TTS_BREAK_';

    private const BREAK_TOKEN_SUFFIX = ']]';

    /** @var array<string, string> */
    private const BREAKS = [
        'short' => '350ms',
        'line' => '450ms',
        'paragraph' => '650ms',
        'heading' => '850ms',
    ];

    /**
     * Abbreviation → natural spoken form.
     * Longer keys must come first so partial matches don't fire before full ones.
     *
     * @var array<string, string>
     */
    private const DICTIONARY = [
        'RVR1960' => 'Reina Valera 1960',
        'RVR2015' => 'Reina Valera actualizada 2015',
        'RVR1909' => 'Reina Valera 1909',
        'NBLH'    => 'Nueva Biblia Latinoamericana de Hoy',
        'LBLA'    => 'La Biblia de las Américas',
        'NTV'     => 'Nueva Traducción Viviente',
        'NVI'     => 'Nueva Versión Internacional',
        'DHH'     => 'Dios Habla Hoy',
        'PDT'     => 'Palabra de Dios para Todos',
        'TLA'     => 'Traducción en Lenguaje Actual',
        'BLS'     => 'Biblia en Lenguaje Sencillo',
        'RVR'     => 'Reina Valera',
        'NKJV'    => 'New King James Version',
        'KJV'     => 'King James Version',
        'NIV'     => 'New International Version',
        'ESV'     => 'English Standard Version',
        'NLT'     => 'New Living Translation',
    ];

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

    public function generateFromHtml(
        string $html,
        string $lang = 'es-CO',
        string $voice = 'es-CO-SalomeNeural',
        int $rate = 0
    ): string {
        return $this->generate($this->speechTextFromHtml($html), $lang, $voice, $rate);
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
        $cleanText = $this->applyDictionary($cleanText);

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

    public function deleteForHtml(
        string $html,
        string $lang = 'es-CO',
        string $voice = 'es-CO-SalomeNeural',
        int $rate = 0
    ): void {
        $this->deleteForText($this->speechTextFromHtml($html), $lang, $voice, $rate);
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

    private function applyDictionary(string $text): string
    {
        foreach (self::DICTIONARY as $abbr => $expansion) {
            $text = (string) preg_replace('/\b'.preg_quote($abbr, '/').'\b/', $expansion, $text);
        }

        return $text;
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
        $escapedText = $this->escapeTextWithBreaks($text);

        return <<<SSML
<speak version="1.0" xml:lang="{$lang}" xmlns="http://www.w3.org/2001/10/synthesis">
    <voice name="{$voice}">
        <prosody rate="{$rate}">{$escapedText}</prosody>
    </voice>
</speak>
SSML;
    }

    private function speechTextFromHtml(string $html): string
    {
        $html = preg_replace('/<\s*br\s*\/?\s*>/iu', ' '.$this->breakToken('line').' ', $html) ?? $html;
        $html = preg_replace('/<\/\s*(h1|h2|h3|h4|h5|h6)\s*>/iu', ' '.$this->breakToken('heading').' ', $html) ?? $html;
        $html = preg_replace('/<\/\s*(p|div|section|article|blockquote|tr)\s*>/iu', ' '.$this->breakToken('paragraph').' ', $html) ?? $html;
        $html = preg_replace('/<\/\s*li\s*>/iu', ' '.$this->breakToken('short').' ', $html) ?? $html;
        $html = preg_replace('/<\/\s*(ul|ol|table)\s*>/iu', ' '.$this->breakToken('paragraph').' ', $html) ?? $html;

        $text = strip_tags($html);
        $text = html_entity_decode($text, ENT_QUOTES | ENT_HTML5, 'UTF-8');

        return $this->normalizeSpeechText($text);
    }

    private function normalizeSpeechText(string $text): string
    {
        $tokens = implode('|', array_map(fn (string $name) => preg_quote($this->breakToken($name), '/'), array_keys(self::BREAKS)));
        $text = preg_replace('/\s*('.$tokens.')\s*/u', ' $1 ', $text) ?? $text;
        $text = preg_replace('/[ \t]+/u', ' ', $text) ?? $text;
        $text = preg_replace('/(?:\s*(?:'.$tokens.')\s*){4,}/u', ' '.$this->breakToken('heading').' ', $text) ?? $text;

        return trim($text);
    }

    private function breakToken(string $name): string
    {
        return self::BREAK_TOKEN_PREFIX.$name.self::BREAK_TOKEN_SUFFIX;
    }

    private function escapeTextWithBreaks(string $text): string
    {
        $pattern = '/'.preg_quote(self::BREAK_TOKEN_PREFIX, '/').'('.implode('|', array_keys(self::BREAKS)).')'.preg_quote(self::BREAK_TOKEN_SUFFIX, '/').'/';
        $chunks = preg_split($pattern, $text, -1, PREG_SPLIT_DELIM_CAPTURE);

        if ($chunks === false) {
            return e($text);
        }

        $ssml = '';
        foreach ($chunks as $index => $chunk) {
            if ($chunk === '') {
                continue;
            }

            if ($index % 2 === 1 && isset(self::BREAKS[$chunk])) {
                $ssml .= '<break time="'.self::BREAKS[$chunk].'" />';

                continue;
            }

            $ssml .= e($chunk);
        }

        return $ssml;
    }
}
