<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class AssignVisitorId
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if ($request->cookie('visitor_id')) {
            return $response;
        }

        $response->cookie(
            'visitor_id',
            (string) Str::uuid(),
            60 * 24 * 365, // 1 año
            '/',
            null,
            true,  // secure
            true,  // httpOnly — JS no puede leerla
            false,
            'Lax'
        );

        return $response;
    }
}