<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;
use NotificationChannels\WebPush\WebPushChannel;
use NotificationChannels\WebPush\WebPushMessage;

class NuevoContenidoNotification extends Notification
{
    public function __construct(
        private readonly string $titulo,
        private readonly string $cuerpo,
        private readonly string $url,
        private readonly string $icono = '/assets/img/logo.png',
    ) {}

    public function via(object $notifiable): array
    {
        return [WebPushChannel::class];
    }

    public function toWebPush(object $notifiable, object $notification): WebPushMessage
    {
        return (new WebPushMessage())
            ->title($this->titulo)
            ->body($this->cuerpo)
            ->icon($this->icono)
            ->action('Ver ahora', 'open')
            ->data(['url' => $this->url])
            ->options(['TTL' => 86400]);
    }
}