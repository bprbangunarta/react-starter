<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

/**
 * The one-time code sent for two-factor sign-in and for turning two-factor on. HTML for people, plain text for clients
 * and spam filters that prefer it; the same words in both.
 */
class LoginCode extends Mailable
{
    use Queueable;

    public function __construct(public string $code, public int $minutes, public ?string $name = null) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: config('app.name').': kode verifikasi '.$this->code);
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.login-code',
            text: 'emails.login-code-text',
            with: ['sentAt' => now()->setTimezone((string) config('app.timezone'))->isoFormat('D MMMM YYYY, HH:mm').' WIB'],
        );
    }
}
