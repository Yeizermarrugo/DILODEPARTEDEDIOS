<?php

namespace App\Http\Controllers;

use App\Models\Devocional;
use App\Models\Ensenanza;
use App\Services\ShortCodeService;
use Illuminate\Http\Request;

class ShortUrlController extends Controller
{
    public function redirect(string $code)
    {
        $devocional = Devocional::where('short_code', $code)->first();

        if ($devocional) {
            $url = match ($devocional->is_devocional) {
                0       => route('estudio-biblico.details', $devocional->id),
                2       => route('ensenanza.details', $devocional->id),
                default => route('devocional.details', $devocional->id),
            };

            return redirect($url, 302);
        }

        $ensenanza = Ensenanza::where('short_code', $code)->first();

        if ($ensenanza) {
            return redirect(route('ensenanza.details', $ensenanza->id), 302);
        }

        abort(404);
    }

    public function getOrCreate(Request $request, string $type, string $id)
    {
        $service = new ShortCodeService();

        if ($type === 'ensenanza') {
            $record = Ensenanza::findOrFail($id);
        } else {
            $record = Devocional::findOrFail($id);
        }

        if (!$record->short_code) {
            $record->short_code = $service->generate();
            $record->save();
        }

        return response()->json([
            'short_url' => url('/' . $record->short_code),
        ]);
    }
}
