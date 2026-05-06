<?php

namespace App\Mail;

use App\Models\ContactMessage;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ContactFormMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public ContactMessage $contact) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '[Contacto] ' . $this->contact->subject . ' — ' . $this->contact->name,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'mail.contact-form',
        );
    }
}
