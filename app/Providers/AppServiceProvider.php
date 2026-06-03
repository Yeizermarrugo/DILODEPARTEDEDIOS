<?php

namespace App\Providers;

use Illuminate\Mail\Events\MessageSending;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Event::listen(MessageSending::class, function (MessageSending $event): bool {
            if ((bool) config('mail.enabled', true)) {
                return true;
            }

            Log::warning('Mail send blocked because MAIL_ENABLED is false', [
                'subject' => $event->message->getSubject(),
                'to_count' => count($event->message->getTo()),
            ]);

            return false;
        });
    }
}
