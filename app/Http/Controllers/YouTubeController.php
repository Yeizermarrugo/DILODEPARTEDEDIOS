<?php

namespace App\Http\Controllers;

use Illuminate\Broadcasting\Channel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class YouTubeController extends Controller
{
    public function latestVideos(Request $request)
    {
        $channelId = $request->get('channelId', env('YOUTUBE_CHANNEL_ID'));
        $maxResults = $request->get('maxResults', 3);

        // Cache por 30 minutos
        $cacheKey = "yt-videos-{$channelId}-{$maxResults}";
        $videos = Cache::remember($cacheKey, 1800, function () use ($channelId, $maxResults) {
            $apiKey = env('YOUTUBE_API_KEY');
            $url = "https://www.googleapis.com/youtube/v3/search";
            $response = Http::get($url, [
                'order' => 'date',
                'part' => 'snippet',
                'channelId' => $channelId,
                'maxResults' => $maxResults,
                'type' => 'video',
                'key' => $apiKey,
            ]);
            return $response->json();
        });

        return response()->json($videos);
    }
}
