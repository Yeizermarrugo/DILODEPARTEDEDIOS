<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contenido publicado</title>
    <style>
    body {
        font-family: 'Segoe UI', Arial, sans-serif;
        background: #f4f0e8;
        margin: 0;
        padding: 24px;
        color: #1f2937;
    }

    .card {
        background: #fff;
        border-radius: 16px;
        max-width: 580px;
        margin: 0 auto;
        overflow: hidden;
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.10);
    }

    /* ── Hero ── */
    .hero {
        background: linear-gradient(135deg, #2d465e 0%, #1a2e40 100%);
        padding: 36px 32px 28px;
        position: relative;
        overflow: hidden;
    }

    .hero::before {
        content: '';
        position: absolute;
        top: -40px;
        right: -40px;
        width: 200px;
        height: 200px;
        background: rgba(247, 88, 21, 0.12);
        border-radius: 50%;
    }

    .hero::after {
        content: '';
        position: absolute;
        bottom: -60px;
        left: -30px;
        width: 160px;
        height: 160px;
        background: rgba(247, 88, 21, 0.08);
        border-radius: 50%;
    }

    .hero-tag {
        display: inline-block;
        background: rgba(247, 88, 21, 0.18);
        color: #f75815;
        font-size: 0.7rem;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        padding: 4px 12px;
        border-radius: 20px;
        margin-bottom: 14px;
        border: 1px solid rgba(247, 88, 21, 0.3);
        position: relative;
        z-index: 1;
    }

    .hero-greeting {
        color: rgba(255, 255, 255, 0.55);
        font-size: 0.85rem;
        margin: 0 0 6px;
        position: relative;
        z-index: 1;
    }

    .hero h1 {
        color: #fff;
        font-size: 1.35rem;
        margin: 0;
        font-weight: 700;
        line-height: 1.35;
        position: relative;
        z-index: 1;
    }

    .hero-sun {
        font-size: 2rem;
        position: absolute;
        top: 28px;
        right: 32px;
        z-index: 1;
    }

    /* ── Body ── */
    .body {
        padding: 28px 32px;
    }

    .announce {
        font-size: 0.95rem;
        color: #374151;
        line-height: 1.7;
        margin: 0 0 22px;
    }

    .announce strong {
        color: #2d465e;
    }

    /* ── Content card ── */
    .content-card {
        background: #faf8f4;
        border: 1px solid #e8e2d8;
        border-radius: 12px;
        padding: 18px 20px;
        margin: 0 0 24px;
        border-left: 4px solid #f75815;
    }

    .content-tipo {
        font-size: 0.7rem;
        font-weight: 700;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: #f75815;
        margin: 0 0 6px;
    }

    .content-titulo {
        font-size: 1rem;
        font-weight: 600;
        color: #1f2937;
        margin: 0 0 10px;
        line-height: 1.4;
    }

    .content-meta {
        font-size: 0.8rem;
        color: #9ca3af;
        margin: 0;
    }

    /* ── CTA button ── */
    .cta-wrap {
        text-align: center;
        margin: 0 0 24px;
    }

    .cta-btn {
        display: inline-block;
        background: #f75815;
        color: #fff !important;
        font-size: 0.9rem;
        font-weight: 700;
        padding: 14px 32px;
        border-radius: 50px;
        text-decoration: none;
        letter-spacing: 0.02em;
        box-shadow: 0 4px 14px rgba(247, 88, 21, 0.35);
    }

    /* ── Short URL ── */
    .url-box {
        background: #f9fafb;
        border: 1px dashed #d1d5db;
        border-radius: 8px;
        padding: 12px 16px;
        margin: 0 0 24px;
    }

    .url-label {
        font-size: 0.7rem;
        font-weight: 600;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: #9ca3af;
        margin: 0 0 4px;
    }

    .url-value {
        font-size: 0.85rem;
        color: #2d465e;
        font-family: monospace;
        word-break: break-all;
        margin: 0;
    }

    /* ── Divider ── */
    .divider {
        border: none;
        border-top: 1px solid #f0ece4;
        margin: 0 0 20px;
    }

    /* ── Closing ── */
    .closing {
        font-size: 0.9rem;
        color: #6b7280;
        line-height: 1.6;
        margin: 0 0 4px;
    }

    .closing strong {
        color: #2d465e;
    }

    /* ── Footer ── */
    .footer {
        padding: 16px 32px;
        background: #f9fafb;
        border-top: 1px solid #e5e7eb;
        font-size: 0.75rem;
        color: #9ca3af;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .footer-dot {
        color: #f75815;
    }
    </style>
</head>

<body>
    <div class="card">

        <div class="hero">
            <span class="hero-sun">🌅</span>
            <div class="hero-tag">{{ $tipo }}</div>
            <p class="hero-greeting">¡Buenos días! · Dilo de parte de Dios</p>
            <h1>Nuevo contenido ya está<br>visible para el público</h1>
        </div>

        <div class="body">
            <p class="announce">
                ¡Buenas noticias! El contenido programado para hoy
                <strong>{{ now()->timezone('America/Bogota')->format('d/m/Y') }}</strong>
                fue habilitado automáticamente y ya está disponible para todos los visitantes.
            </p>

            <div class="content-card">
                <p class="content-tipo">{{ $tipo }}</p>
                <p class="content-titulo">{{ $titulo }}</p>
                <p class="content-meta">
                    Publicado el
                    {{ $devocional->created_at->timezone('America/Bogota')->format('d/m/Y \a \l\a\s H:i') }} · Bogotá
                </p>
            </div>

            <div class="cta-wrap">
                <a href="{{ $shortUrl }}" class="cta-btn">Ver contenido →</a>
            </div>

            <div class="url-box">
                <p class="url-label">Ingresa aquí</p>
                <p class="url-value">{{ $shortUrl }}</p>
            </div>

            <hr class="divider">

            <p class="closing">
                Comparte este enlace en redes sociales y con la comunidad. 🙌<br>
                <strong>Dilo de parte de Dios</strong> — que su palabra llegue a cada corazón hoy.
            </p>
        </div>

        <div class="footer">
            <span class="footer-dot">●</span>
            Notificación automática · dilodepartededios.com
            <span class="footer-dot">●</span>
            {{ now()->timezone('America/Bogota')->format('d/m/Y H:i') }} (Bogotá)
        </div>

    </div>
</body>

</html>