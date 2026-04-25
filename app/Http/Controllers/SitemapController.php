<?php

namespace App\Http\Controllers;

use App\Models\Devocional;
use Illuminate\Support\Facades\Cache;

class SitemapController extends Controller
{
    public function index()
    {
        $data = Cache::remember('sitemap', 3600, function () {
            $devocionales = Devocional::where('is_devocional', 1)
                ->whereNull('ensenanza_id')
                ->select('id', 'updated_at')
                ->orderByDesc('updated_at')
                ->get();

            $estudios = Devocional::where('is_devocional', 0)
                ->select('id', 'updated_at')
                ->orderByDesc('updated_at')
                ->get();

            $series = Devocional::whereNotNull('ensenanza_id')
                ->select('id', 'updated_at')
                ->orderByDesc('updated_at')
                ->get();

            return compact('devocionales', 'estudios', 'series');
        });

        $xml = response()->view('sitemap', $data)
            ->header('Content-Type', 'application/xml');

        return $xml;
    }
}
