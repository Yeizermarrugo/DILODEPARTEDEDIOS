<?php

namespace App\Console\Commands;

use App\Models\Devocional;
use App\Models\Visitor;
use App\Notifications\NuevoContenidoNotification;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;

class NotificarDevocionalDiario extends Command
{
    protected $signature   = 'devocional:notificar-diario';
    protected $description = 'Envía notificación push del contenido publicado hoy';

    public function handle(): int
    {
        $visitors = Visitor::has('pushSubscriptions')->get();

        if ($visitors->isEmpty()) {
            return Command::SUCCESS;
        }

        // 1. Devocional
        $devocional = Devocional::where('is_devocional', 1)
            ->whereNull('ensenanza_id')
            ->whereNull('notificado_at')
            ->whereDate('created_at', today())
            ->orderBy('created_at', 'desc')
            ->first();

        if ($devocional) {
            $this->notificar(
                $visitors,
                $devocional,
                '📖 Devocional de hoy',
                "/devocional/{$devocional->id}",
                'h1'   // 👈
            );
        }

        // 2. Estudio Bíblico
        $estudio = Devocional::where('is_devocional', 0)
            ->whereNull('notificado_at')
            ->whereDate('created_at', today())
            ->orderBy('created_at', 'desc')
            ->first();

        if ($estudio) {
            $this->notificar(
                $visitors,
                $estudio,
                '📚 Nuevo Estudio Bíblico',
                "/estudio-biblico/{$estudio->id}",
                'h2'   // 👈
            );
        }


        // 3. Enseñanza
        $ensenanza = Devocional::where('is_devocional', 1)
            ->whereNotNull('ensenanza_id')
            ->whereNull('notificado_at')
            ->whereDate('created_at', today())
            ->orderBy('created_at', 'desc')
            ->first();

        if ($ensenanza) {
            $this->notificar(
                $visitors,
                $ensenanza,
                '🎓 Nueva Enseñanza',
                "/series/{$ensenanza->id}",
                'h2'   // 👈
            );
        }

        return Command::SUCCESS;
    }

    private function extraerTitulo(string $contenido, string $etiqueta): string
    {
        preg_match('/<' . $etiqueta . '[^>]*>(.*?)<\/' . $etiqueta . '>/is', $contenido, $match);

        if (isset($match[1])) {
            return html_entity_decode(strip_tags($match[1]), ENT_QUOTES | ENT_HTML5, 'UTF-8');
        }

        return html_entity_decode(strip_tags(substr($contenido, 0, 80)), ENT_QUOTES | ENT_HTML5, 'UTF-8') . '...';
    }
    private function notificar($visitors, $contenido, string $titulo, string $url, string $etiqueta = 'h1'): void
    {
        try {
            $cuerpo = $this->extraerTitulo($contenido->contenido ?? '', $etiqueta);

            Notification::send(
                $visitors,
                new NuevoContenidoNotification(
                    titulo: $titulo,
                    cuerpo: $cuerpo,
                    url: $url
                )
            );

            $contenido->update(['notificado_at' => now()]);
        } catch (\Exception $e) {
            Log::error('devocional:notificar-diario falló', [
                'tipo'  => $titulo,
                'id'    => $contenido->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}