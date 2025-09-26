<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class TTSController extends Controller
{
    private $allowedVoices = [
        'es-mx' => ['Juana', 'Silvia', 'Teresa', 'Jose'],
        'es-es' => ['Jorge', 'Francisco', 'Mia', 'Sofia'],
    ];

    public function voiceRss(Request $request)
    {
        $apiKey = env('VOICE_RSS_API_KEY');
        $lang = $request->input('lang', 'es-mx');
        $texto = $request->input('texto', '');
        $rate = $request->input('r', '0');
        $voice = $request->input('v', 'Juana');

        if (empty($texto)) {
            return response('Texto requerido', 400);
        }

        $voicesForLang = $this->allowedVoices[$lang] ?? [];
        if (!in_array($voice, $voicesForLang)) {
            $voice = $voicesForLang[0] ?? 'Juana';
        }

        // Clave única para el archivo mp3
        $ttsKey = md5($lang . '|' . $voice . '|' . $rate . '|' . $texto);
        $audioPath = "tts/{$ttsKey}.mp3";

        // Usamos storage 'public' para que sea accesible por URL
        if (Storage::disk('public')->exists($audioPath)) {
            $url = Storage::disk('public')->url($audioPath);
            return response()->json(['url' => $url]);
        }

        // Si no existe, lo genera con Voice RSS
        $voiceRssUrl = "https://api.voicerss.org/";
        $params = [
            'key' => $apiKey,
            'hl' => $lang,
            'src' => $texto,
            'c' => 'MP3',
            'r' => $rate,
            'v' => $voice,
        ];

        $response = Http::get($voiceRssUrl, $params);

        if ($response->ok() && strpos($response->header('Content-Type'), 'audio') !== false) {
            $audio = $response->body();
            Storage::disk('public')->put($audioPath, $audio);
            $url = Storage::disk('public')->url($audioPath);
            return response()->json(['url' => $url]);
        } else {
            Log::error('Voice RSS Error: ' . $response->body());
            return response('Error externo: ' . $response->body(), 500);
        }
    }
    public function voices(Request $request)
    {
        $lang = $request->input('lang', 'es-mx');
        $voices = $this->allowedVoices[$lang] ?? [];

        $voicesList = array_map(function ($voice) {
            return [
                'label' => $voice,
                'value' => $voice,
                'available' => true
            ];
        }, $voices);

        return response()->json($voicesList);
    }
}
