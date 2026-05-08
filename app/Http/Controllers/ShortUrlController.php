<?php

namespace App\Http\Controllers;

use App\Models\Devocional;
use App\Models\Ensenanza;
use App\Services\ShortCodeService;
use Illuminate\Support\Facades\Cache;

class ShortUrlController extends Controller
{
    public function redirect(string $code)
    {
        $devocional = Devocional::where('short_code', $code)->first();

        if ($devocional) {
            $url = match ($devocional->is_devocional) {
                Devocional::TYPE_ESTUDIO => route('estudio-biblico.details', $devocional->id),
                Devocional::TYPE_SERIE   => route('ensenanza.details', $devocional->id),
                default                  => route('devocional.details', $devocional->id),
            };

            return redirect($url, 302);
        }

        $ensenanza = Ensenanza::where('short_code', $code)->first();

        if ($ensenanza) {
            return redirect(route('ensenanza.details', $ensenanza->id), 302);
        }

        abort(404);
    }

    public function getOrCreate(string $type, string $id)
    {
        $service = new ShortCodeService();

        $record = Devocional::findOrFail($id);

        if (!$record->short_code) {
            $record->short_code = $service->generate();
            $record->save();
        }

        return response()->json([
            'short_url' => url('/' . $record->short_code),
        ]);
    }

    public function trackShare(string $type, string $id)
    {
        // El type='ensenanza' indica un episodio de serie, pero el registro
        // vive en devocionals (el ID es un UUID de Devocional).
        Devocional::where('id', $id)->increment('shares_count');

        if ($type === 'estudio') {
            Cache::forget('estudios-list');
        }

        return response()->json(['ok' => true]);
    }
}
