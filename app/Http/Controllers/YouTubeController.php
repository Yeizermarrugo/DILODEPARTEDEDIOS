<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Collection;

class YouTubeController extends Controller
{
    public function latestVideos(Request $request)
    {
        $channelId  = $request->get('channelId', env('YOUTUBE_CHANNEL_ID'));
        // Aumentamos a 50 para tener más margen de filtrado
        $maxResults = $request->get('maxResults', 50);

        $cacheKey = "yt-clases-{$channelId}-{$maxResults}";

        $videos = Cache::remember($cacheKey, 1800, function () use ($channelId, $maxResults) {
            $apiKey = env('YOUTUBE_API_KEY');
            $url    = "https://www.googleapis.com/youtube/v3/search";

            $response = Http::get($url, [
                'order'      => 'date',
                'part'       => 'snippet',
                'channelId'  => $channelId,
                'maxResults' => $maxResults,
                'type'       => 'video',
                'key'        => $apiKey,
            ]);

            $data = $response->json();

            $items = collect($data['items'] ?? [])
                ->filter(function ($item) {
                    $title = strtoupper(trim($item['snippet']['title'] ?? ''));
                    // Usamos str_contains si la palabra "CLASE" puede no estar al puro inicio
                    return str_contains($title, 'CLASE');
                })
                ->take(3)
                ->values();

            // Reestructuramos la respuesta para que mantenga el formato original de YT
            return [
                'items' => $items,
                'pageInfo' => [
                    'totalResults' => $items->count()
                ]
            ];
        });

        return response()->json($videos);
    }
}