<?php

namespace App\Mail;

use App\Models\Devocional;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ContenidoPublicadoMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Devocional $devocional,
        public string $shortUrl,
        public string $tipo,
        public string $titulo,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '🌅 ' . $this->tipo . ' publicado: ' . $this->titulo,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'mail.contenido-publicado',
        );
    }
}
