<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Corre cada minuto entre 6:00 y 6:10 los lunes, miércoles y viernes — notifica suscriptores del contenido publicado hoy.
Schedule::command('devocional:notificar-diario')
    ->cron('0-10 6 * * 1,3,5')
    ->timezone('America/Bogota')
    ->withoutOverlapping();

// Corre cada minuto entre 3:00 y 3:10 AM los lunes, miércoles y viernes — publica contenido oculto programado para hoy y notifica por correo.
Schedule::command('contenido:publicar-programado')
    ->cron('0-10 3 * * 1,3,5')
    ->timezone('America/Bogota')
    ->withoutOverlapping();

// Refuerza el cache de audios para contenido visible reciente; ignora voces ya generadas.
Schedule::command('tts:pregenerate-devocionales --days=15')
    ->dailyAt('03:20')
    ->timezone('America/Bogota')
    ->withoutOverlapping();
