<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AddStaticCacheHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $path = $request->path();

        if (str_starts_with($path, 'build/')) {
            $response->headers->set('Cache-Control', 'public, max-age=31536000, immutable');

            return $response;
        }

        if (preg_match('/\.(?:avif|css|gif|jpe?g|js|png|svg|webp|woff2?)$/i', $path)) {
            $response->headers->set('Cache-Control', 'public, max-age=604800');
        }

        return $response;
    }
}
