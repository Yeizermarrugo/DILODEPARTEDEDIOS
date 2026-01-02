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
    <meta property="og:type" content="article">
    <meta property="og:title" content="{{ $meta['title'] }}">
    <meta property="og:description" content="{{ $meta['description'] }}">
    <meta property="og:url" content="{{ $meta['url'] }}">
    <meta property="og:site_name" content="Dilo de parte de Dios">

    <meta property="og:image" content="{{ $meta['image'] }}">
    <meta property="og:image:secure_url" content="{{ $meta['image'] }}">
    <meta property="og:image:type" content="image/jpeg">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">

    <meta name="twitter:card" content="summary_large_image">
    @endif


    {{-- Inline script to detect system dark mode preference and apply it immediately --}}
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

    {{-- Inline style to set the HTML background color based on our theme in app.css --}}
    <style>
        html {
            background-color: oklch(1 0 0);
        }

        html.dark {
            background-color: oklch(0.145 0 0);
        }
    </style>

    <title inertia>{{ config('app.name', 'Laravel') }}</title>
    <script src="https://analytics.ahrefs.com/analytics.js" data-key="tH+o+/Cdpn18Efh2crVnhQ" async></script>
    <script>
        var ahrefs_analytics_script = document.createElement('script');
        ahrefs_analytics_script.async = true;
        ahrefs_analytics_script.src = 'https://analytics.ahrefs.com/analytics.js';
        ahrefs_analytics_script.setAttribute('data-key', 'tH+o+/Cdpn18Efh2crVnhQ');
        document.getElementsByTagName('head')[0].appendChild(ahrefs_analytics_script);
    </script>
    
    <!-- <link rel="icon" href="/cruz.jpg" sizes="any"> -->
    <link rel="icon" href="/cruz.jpg" type="image/svg+xml">
    <link rel="cruz" href="/cruz.jpg">

    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">
    @routes
    @viteReactRefresh
    @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
    @inertiaHead
</head>

<body class="font-sans antialiased">
    @inertia
</body>

</html>