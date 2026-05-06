<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nuevo mensaje de contacto</title>
    <style>
        body { font-family: 'Segoe UI', sans-serif; background: #f4f4f5; margin: 0; padding: 24px; color: #1f2937; }
        .card { background: #fff; border-radius: 12px; max-width: 580px; margin: 0 auto; overflow: hidden; box-shadow: 0 2px 16px rgba(0,0,0,0.08); }
        .header { background: #2d465e; padding: 28px 32px; }
        .header h1 { color: #fff; font-size: 1.2rem; margin: 0; font-weight: 600; }
        .header p { color: rgba(255,255,255,0.65); font-size: 0.875rem; margin: 4px 0 0; }
        .body { padding: 28px 32px; }
        .field { margin-bottom: 18px; }
        .field label { display: block; font-size: 0.72rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #6b7280; margin-bottom: 4px; }
        .field p { margin: 0; font-size: 0.95rem; color: #1f2937; }
        .message-body { background: #f9fafb; border-left: 3px solid #f75815; padding: 14px 16px; border-radius: 0 8px 8px 0; font-size: 0.95rem; line-height: 1.65; white-space: pre-wrap; }
        .footer { padding: 16px 32px; background: #f9fafb; border-top: 1px solid #e5e7eb; font-size: 0.78rem; color: #9ca3af; }
    </style>
</head>
<body>
    <div class="card">
        <div class="header">
            <h1>📬 Nuevo mensaje de contacto</h1>
            <p>Dilo de parte de Dios · dilodepartededios.com</p>
        </div>
        <div class="body">
            <div class="field">
                <label>Nombre</label>
                <p>{{ $contact->name }}</p>
            </div>
            <div class="field">
                <label>Correo electrónico</label>
                <p><a href="mailto:{{ $contact->email }}" style="color:#f75815;">{{ $contact->email }}</a></p>
            </div>
            @if($contact->whatsapp)
            <div class="field">
                <label>WhatsApp</label>
                <p><a href="https://wa.me/{{ preg_replace('/[^0-9]/', '', $contact->whatsapp) }}" style="color:#f75815;">{{ $contact->whatsapp }}</a></p>
            </div>
            @endif
            <div class="field">
                <label>Asunto</label>
                <p>{{ $contact->subject }}</p>
            </div>
            <div class="field">
                <label>Mensaje</label>
                <div class="message-body">{{ $contact->body }}</div>
            </div>
        </div>
        <div class="footer">
            Recibido el {{ $contact->created_at->format('d/m/Y \a \l\a\s H:i') }} · Respondido desde el panel de administración
        </div>
    </div>
</body>
</html>
