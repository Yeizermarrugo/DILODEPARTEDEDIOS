<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Corre cada minuto entre 6:00 y 6:10 — el primer minuto disponible notifica,
// los siguientes salen inmediatamente porque notificado_at ya está seteado.
Schedule::command('devocional:notificar-diario')
    ->cron('0-10 6 * * *')
    ->timezone('America/Bogota')
    ->withoutOverlapping();

// Corre cada minuto entre 3:00 y 3:10 AM — publica contenido oculto programado para hoy y notifica por correo.
Schedule::command('contenido:publicar-programado')
    ->cron('0-10 3 * * *')
    ->timezone('America/Bogota')
    ->withoutOverlapping();