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
        $maxResults = $request->get('maxResults', 10); // Aumenta para capturar más

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
                    $title = trim($item['snippet']['title'] ?? '');
                    return str_starts_with(strtoupper($title), 'CLASE');
                })
                ->take(3) // Limita a 3 después de filtrar
                ->values()
                ->all();

            $data['items'] = $items;
            $data['pageInfo']['totalResults'] = count($items); // Actualiza total

            return $data;
        });

        return response()->json($videos);
    }
}
