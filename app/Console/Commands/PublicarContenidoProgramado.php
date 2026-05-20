<?php

namespace App\Console\Commands;

use App\Mail\ContenidoPublicadoMail;
use App\Models\Devocional;
use App\Services\ShortCodeService;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class PublicarContenidoProgramado extends Command
{
    protected $signature   = 'contenido:publicar-programado';
    protected $description = 'Publica contenido oculto programado para hoy y notifica por correo';

    private const NOTIFY_EMAIL = 'dilodepartededios@gmail.com';
    private const TIMEZONE     = 'America/Bogota';

    public function handle(): int
    {
        $hoy = Carbon::today(self::TIMEZONE);

        $publicados = Devocional::where('hidden', true)
            ->whereDate('created_at', $hoy)
            ->get();

        if ($publicados->isEmpty()) {
            $this->line('Sin contenido programado para hoy.');
            return Command::SUCCESS;
        }

        $shortCodeService = new ShortCodeService();

        foreach ($publicados as $devocional) {
            $devocional->update(['hidden' => false]);

            // Ensure short_code exists
            if (!$devocional->short_code) {
                $devocional->short_code = $shortCodeService->generate();
                $devocional->save();
            }

            $shortUrl = url('/' . $devocional->short_code);
            $tipo     = $this->tipo($devocional->is_devocional);
            $titulo   = $this->extractTitle($devocional->contenido);

            Mail::to(self::NOTIFY_EMAIL)
                ->send(new ContenidoPublicadoMail($devocional, $shortUrl, $tipo, $titulo));

            Log::info('contenido:publicar-programado publicado', [
                'id'           => $devocional->id,
                'is_devocional' => $devocional->is_devocional,
                'short_url'    => $shortUrl,
            ]);

            $this->info("✓ Publicado [{$tipo}]: {$titulo}");
        }

        Cache::forget('devocional-categorias');
        Cache::forget('devocional-autores');
        Cache::forget('search-categorias-series');
        Cache::forget('estudios-list');

        return Command::SUCCESS;
    }

    private function tipo(int $isDevocional): string
    {
        return match ($isDevocional) {
            Devocional::TYPE_ESTUDIO => 'Estudio Bíblico',
            Devocional::TYPE_SERIE   => 'Episodio de Serie',
            default                  => 'Devocional',
        };
    }

    private function extractTitle(string $contenido): string
    {
        foreach (['h1', 'h2', 'h3'] as $tag) {
            if (preg_match("/<{$tag}[^>]*>(.*?)<\/{$tag}>/is", $contenido, $m)) {
                $text = strip_tags($m[1]);
                $text = html_entity_decode($text, ENT_QUOTES | ENT_HTML5, 'UTF-8');
                $text = preg_replace('/\s+/u', ' ', trim($text));
                if ($text) return Str::limit($text, 100);
            }
        }

        $plain = strip_tags($contenido);
        $plain = html_entity_decode($plain, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        return Str::limit(trim($plain), 100) ?: 'Sin título';
    }
}
