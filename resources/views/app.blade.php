<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}"
    class="{{ ($appearance ?? 'system') == 'dark' ? 'dark' : '' }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="facebook-domain-verification" content="61h5nmghvq2nlejfvee1cbqxyrrc56" />
    <meta name="ahrefs-site-verification" content="606b26e73011bbfefcc48758d92d1e7f4d3c82dc796523b618e47b8d19073037">

    @php
    $meta = $page['props']['meta'] ?? null;
    $currentPath = request()->path();

    // Mapeo de secciones
    $sections = [
    'about' => '| Quiénes somos',
    'devocionales' => '| Devocionales',
    'ensenanzas' => '| Series',
    'estudios' => '| Estudios bíblicos',
    'libreria' => '| Librería',
    'podcast' => '| Podcast y más',
    'obras' => '| Obras',
    'login' => '| Iniciar sesión',
    'dashboard' => '| Dashboard',
    'devocionales-edit' => '| Editar devocionales',
    'devocionalesAgregar' => '| Agregar devocionales'
    ];

    // Lógica para detectar si es una subpágina de devocional (ej: devocional/id)
    $sectionName = '';
    if (str_starts_with($currentPath, 'devocional/')) {
    $sectionName = '| Devocional';
    } else {
    $sectionName = $sections[$currentPath] ?? '';
    }

    if ($currentPath == '/' || empty($currentPath)) {
    $sectionName = '';
    }

    $defaultTitle = "Dilo de parte de Dios " . $sectionName;

    $currentTitle = $meta['title'] ?? $defaultTitle;
    $currentDesc = $meta['description'] ?? "Plataforma de recursos cristianos para conectar con Dios a través de
    estudios bíblicos, series temáticas y herramientas de crecimiento espiritual.";
    $currentUrl = $meta['url'] ?? url()->current();
    $currentImage = $meta['image'] ??
    'https://fls-a083ae02-d46d-49e7-84b6-1804f2c1bf37.laravel.cloud/imagenes/4PwemROBsNnno4Dulug2ADhR3bapRyhF6RliAM0u.jpg';
    @endphp

    <title>{{ $currentTitle }}</title>
    <meta name="description" content="{{ $currentDesc }}">
    <link rel="canonical" href="{{ url()->current() }}">

    <meta property="og:type" content="{{ $meta ? 'article' : 'website' }}">
    <meta property="og:site_name" content="Dilo de parte de Dios">
    <meta property="og:title" content="{{ $currentTitle }}">
    <meta property="og:description" content="{{ $currentDesc }}">
    <meta property="og:url" content="{{ $currentUrl }}">
    <meta property="og:image" content="{{ $currentImage }}">
    <meta property="og:image:secure_url" content="{{ $currentImage }}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="{{ $currentTitle }}">

    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{{ $currentTitle }}">
    <meta name="twitter:description" content="{{ $currentDesc }}">
    <meta name="twitter:image" content="{{ $currentImage }}">

    <link rel="icon" type="image/png" sizes="32x32"
        href="https://fls-a083ae02-d46d-49e7-84b6-1804f2c1bf37.laravel.cloud/imagenes/4PwemROBsNnno4Dulug2ADhR3bapRyhF6RliAM0u.jpg">
    <link rel="apple-touch-icon" sizes="180x180"
        href="https://fls-a083ae02-d46d-49e7-84b6-1804f2c1bf37.laravel.cloud/imagenes/4PwemROBsNnno4Dulug2ADhR3bapRyhF6RliAM0u.jpg">

    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">

    @routes
    @viteReactRefresh
    @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
    @inertiaHead
</head>

<body class="font-sans antialiased">
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

    <script src="https://analytics.ahrefs.com/analytics.js" data-key="tH+o+/Cdpn18Efh2crVnhQ" async></script>

    @inertia
</body>

</html>