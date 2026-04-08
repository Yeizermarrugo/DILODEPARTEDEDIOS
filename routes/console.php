<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('devocional:notificar-diario')
    // ->dailyAt('06:00')
    ->everyMinute()
    ->timezone('America/Bogota')
    ->withoutOverlapping();