<?php

namespace App\Jobs;

use App\Models\Devocional;
use App\Models\DevocionalView;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use Stevebauman\Location\Facades\Location;

class TrackDevocionalView implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 1;
    public int $timeout = 10;

    public function __construct(
        private string $devocionalId,
        private string $ipToSave,
        private string $rawIp,
        private string $browser,
        private string $platform,
        private string $localTime,
        private bool   $isWorkIp,
    ) {}

    public function handle(): void
    {
        $loc = Location::get($this->rawIp);

        $view = new DevocionalView();
        $view->timestamps     = false;
        $view->devocional_id  = $this->devocionalId;
        $view->ip_address     = $this->ipToSave;
        $view->country        = $loc ? $loc->countryName : 'Desconocido';
        $view->city           = $loc ? $loc->cityName    : 'Desconocida';
        $view->browser        = $this->browser;
        $view->platform       = $this->platform;
        $view->accepted_terms = true;
        $view->created_at     = $this->localTime;
        $view->updated_at     = $this->localTime;
        $view->save();

        $shouldIncrement = false;

        if ($this->isWorkIp) {
            $shouldIncrement = true;
        } else {
            $dayCheck = DevocionalView::where('devocional_id', $this->devocionalId)
                ->where('ip_address', $this->ipToSave)
                ->where('created_at', '>', now()->subDay())
                ->count();

            if ($dayCheck === 1) {
                $shouldIncrement = true;
            }
        }

        if ($shouldIncrement) {
            Devocional::where('id', $this->devocionalId)->increment('views_count');
            Cache::forget('estudios-list');
        }
    }
}
