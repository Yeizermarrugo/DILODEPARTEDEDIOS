<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TTSController extends Controller
{
    // Lista de voces permitidas por idioma
    private $allowedVoices = [
        'es-mx' => ['Juana', 'Silvia', 'Teresa', 'Jose'],
        // Puedes agregar más idiomas y voces si lo necesitas
    ];

    public function voiceRss(Request $request)
    {
        $apiKey = '496050bc27234320956dde2b41f80e96'; // <-- pon aquí tu API Key de Voice RSS
        $lang = $request->input('lang', 'es-mx');
        $texto = $request->input('texto', '');
        $rate = $request->input('r', '0');
        $voice = $request->input('v', 'Juana'); // El frontend envía 'v' como voz seleccionada

        if (empty($texto)) {
            return response('Texto requerido', 400);
        }

        // Validar voz permitida para el idioma
        $voicesForLang = $this->allowedVoices[$lang] ?? [];
        if (!in_array($voice, $voicesForLang)) {
            $voice = $voicesForLang[0] ?? 'Juana'; // Voz default si no está permitida
        }

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

        if ($response->ok()) {
            $contentType = $response->header('Content-Type');
            if (strpos($contentType, 'audio') !== false) {
                return response($response->body(), 200)
                    ->header('Content-Type', 'audio/mpeg');
            } else {
                Log::error('Voice RSS Error: ' . $response->body());
                return response('Error externo: ' . $response->body(), 500);
            }
        } else {
            Log::error('Voice RSS HTTP Error: ' . $response->body());
            return response('Error generando el audio', 500);
        }
    }

    // Endpoint para consultar las voces permitidas por idioma
    public function voices(Request $request)
    {
        $lang = $request->input('lang', 'es-mx');
        $voices = $this->allowedVoices[$lang] ?? [];

        $voicesList = array_map(function ($voice) {
            return [
                'label' => $voice,
                'value' => $voice,
                'available' => true // Puedes modificar si alguna voz no está disponible
            ];
        }, $voices);

        return response()->json($voicesList);
    }
}
