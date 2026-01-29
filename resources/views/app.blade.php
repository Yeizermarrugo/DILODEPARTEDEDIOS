<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark'=> ($appearance ?? 'system') == 'dark'])>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="facebook-domain-verification" content="61h5nmghvq2nlejfvee1cbqxyrrc56" />
    <meta name="ahrefs-site-verification" content="606b26e73011bbfefcc48758d92d1e7f4d3c82dc796523b618e47b8d19073037">

    @php
    $meta = $page['props']['meta'] ?? null;
    @endphp

    @if($meta)
    <!-- Open Graph -->
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="Dilo de parte de Dios">
    <meta property="og:title" content="{{ $meta['title'] }}">
    <meta property="og:description" content="{{ $meta['description'] }}">
    <meta property="og:url" content="{{ $meta['url'] }}">

    <meta property="og:image" content="{{ $meta['image'] }}">
    <meta property="og:image:secure_url" content="{{ $meta['image'] }}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="{{ $meta['title'] }}">

    <!-- Twitter (WhatsApp lo usa en móvil) -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{{ $meta['title'] }}">
    <meta name="twitter:description" content="{{ $meta['description'] }}">
    <meta name="twitter:image" content="{{ $meta['image'] }}">

    @endif

    <title>{{ config('app.name', 'Dilo de parte de Dios') }}</title>

    <link rel="icon" type="image/png" sizes="32x32"
        href="https://fls-a083ae02-d46d-49e7-84b6-1804f2c1bf37.laravel.cloud/imagenes/4PwemROBsNnno4Dulug2ADhR3bapRyhF6RliAM0u.jpg">
    <link rel="icon" type="image/png" sizes="16x16"
        href="https://fls-a083ae02-d46d-49e7-84b6-1804f2c1bf37.laravel.cloud/imagenes/4PwemROBsNnno4Dulug2ADhR3bapRyhF6RliAM0u.jpg">
    <link rel="apple-touch-icon" sizes="180x180"
        href="https://fls-a083ae02-d46d-49e7-84b6-1804f2c1bf37.laravel.cloud/imagenes/4PwemROBsNnno4Dulug2ADhR3bapRyhF6RliAM0u.jpg">

    <!-- Fuentes y estilos principales -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">

    @routes
    @viteReactRefresh
    @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
    @inertiaHead
</head>

<body class="font-sans antialiased">
    {{-- Dark mode + estilos de fondo (mover aquí para no interferir con previews) --}}
    <script>
    (function() {
        const appearance = '{{ $appearance ?? "system" }}';
        if (appearance === 'system') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
                document.documentElement.classList.add('dark');
            }
        }
    })();
    </script>

    <style>
    html {
        background-color: oklch(1 0 0);
    }

    html.dark {
        background-color: oklch(0.145 0 0);
    }
    </style>

    <!-- Ahrefs analytics: una sola vez -->
    <script src="https://analytics.ahrefs.com/analytics.js" data-key="tH+o+/Cdpn18Efh2crVnhQ" async></script>

    @inertia
</body>


</html>