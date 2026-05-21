<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class YouTubeController extends Controller
{
    public function latestVideos()
    {
        $channelId  = env('YOUTUBE_CHANNEL_ID');
        $maxResults = 50;

        $cacheKey = 'yt-clases-latest';

        $videos = Cache::get($cacheKey);

        if (!$videos) {
            try {
                $apiKey  = env('YOUTUBE_API_KEY');
                $url     = "https://www.googleapis.com/youtube/v3/search";

                $response = Http::timeout(8)->get($url, [
                    'order'      => 'date',
                    'part'       => 'snippet',
                    'channelId'  => $channelId,
                    'maxResults' => $maxResults,
                    'type'       => 'video',
                    'key'        => $apiKey,
                ]);

                if (!$response->successful()) {
                    Log::warning('YouTube API error', ['status' => $response->status(), 'body' => $response->body()]);
                    return response()->json(['items' => [], 'pageInfo' => ['totalResults' => 0]]);
                }

                $data  = $response->json();
                $items = collect($data['items'] ?? [])
                    ->filter(fn ($item) => str_contains(strtoupper(trim($item['snippet']['title'] ?? '')), 'CLASE'))
                    ->take(3)
                    ->values();

                $videos = ['items' => $items, 'pageInfo' => ['totalResults' => $items->count()]];
                Cache::put($cacheKey, $videos, 1800);
            } catch (\Throwable $e) {
                Log::error('YouTube API timeout/error', ['error' => $e->getMessage()]);
                return response()->json(['items' => [], 'pageInfo' => ['totalResults' => 0]]);
            }
        }

        return response()->json($videos);
    }
}