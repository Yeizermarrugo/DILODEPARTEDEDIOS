<?php

namespace App\Http\Controllers;

use App\Services\TextToSpeechService;
use Illuminate\Http\Request;

class TTSController extends Controller
{
    public function voiceRss(Request $request, TextToSpeechService $tts)
    {
        $lang = $request->input('lang', 'es-CO');
        $texto = trim((string) $request->input('texto', ''));
        $rate = (int) $request->input('r', 0);
        $voice = $request->input('v', 'es-CO-SalomeNeural');

        if ($texto === '') {
            return response('Texto requerido', 400);
        }

        try {
            $payload = $request->input('format') === 'html'
                ? $tts->generateFromHtmlWithTimings($texto, $lang, $voice, $rate, $request->input('blocks'))
                : ['url' => $tts->generate($texto, $lang, $voice, $rate), 'timings' => null];
        } catch (\InvalidArgumentException $exception) {
            return response($exception->getMessage(), 400);
        } catch (\RuntimeException $exception) {
            return response($exception->getMessage(), 500);
        }

        return response()->json($payload);
    }

    public function voices(Request $request, TextToSpeechService $tts)
    {
        return response()->json($tts->voices($request->input('lang', 'es-CO')));
    }
}
