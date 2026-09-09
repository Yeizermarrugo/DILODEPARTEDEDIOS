<?php

namespace App\Http\Controllers;

use App\Models\Devocional;
use App\Services\DevocionalAudioFolderService;
use App\Services\TextToSpeechService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use ZipArchive;

class DevocionalAudioFolderController extends Controller
{
    public function index(DevocionalAudioFolderService $folders)
    {
        $counts = $folders->counts();

        $summary = collect(DevocionalAudioFolderService::MONTH_NAMES)->map(fn (string $name, int $month) => [
            'month' => $month,
            'name' => $name,
            'capacity' => DevocionalAudioFolderService::MONTH_CAPACITIES[$month],
            'count' => (int) ($counts[$month] ?? 0),
        ])->values();

        return Inertia::render('DevocionalAudioFolders', [
            'folders' => $summary,
            'totalCapacity' => array_sum(DevocionalAudioFolderService::MONTH_CAPACITIES),
            'totalAssigned' => array_sum($counts),
        ]);
    }

    public function generate(DevocionalAudioFolderService $folders)
    {
        $assigned = $folders->fillGaps();

        return back()->with('status', $assigned > 0
            ? "Se asignaron {$assigned} devocionales a las carpetas."
            : 'No hay devocionales nuevos para asignar (o las 12 carpetas ya están completas).');
    }

    public function show(int $month, TextToSpeechService $tts)
    {
        abort_unless(array_key_exists($month, DevocionalAudioFolderService::MONTH_NAMES), 404);

        $devocionales = Devocional::inAudioFolder($month)->get();

        $items = $devocionales->map(fn (Devocional $devocional) => [
            'id' => $devocional->id,
            'position' => $devocional->audio_folder_position,
            'categoria' => $devocional->categoria,
            'autor' => $devocional->autor,
            'imagen' => $devocional->imagen,
            'titulo' => $this->titleFromHtml($devocional->contenido ?? ''),
            'views_count' => $devocional->views_count,
            'filename' => $tts->filenameFromHtml($devocional->contenido ?? '', "devocional-{$devocional->audio_folder_position}"),
        ]);

        $todasLasCategorias = Devocional::whereNotNull('categoria')
            ->where('categoria', '!=', '')
            ->distinct()
            ->pluck('categoria')
            ->map(fn (string $categoria) => strtolower(trim($categoria)))
            ->sort()
            ->values();

        $monthOptions = collect(DevocionalAudioFolderService::MONTH_NAMES)->map(fn (string $name, int $m) => [
            'month' => $m,
            'name' => $name,
        ])->values();

        return Inertia::render('DevocionalAudioFolderDetail', [
            'month' => $month,
            'monthName' => DevocionalAudioFolderService::MONTH_NAMES[$month],
            'capacity' => DevocionalAudioFolderService::MONTH_CAPACITIES[$month],
            'items' => $items,
            'voicePairs' => $tts->voicePairs(),
            'todasLasCategorias' => $todasLasCategorias,
            'monthOptions' => $monthOptions,
        ]);
    }

    public function move(Request $request, DevocionalAudioFolderService $folders)
    {
        $validated = $request->validate([
            'id' => 'required|uuid',
            'month' => 'required|integer|min:1|max:12',
        ]);

        $devocional = Devocional::soloDevocionales()->findOrFail($validated['id']);

        try {
            $folders->move($devocional, (int) $validated['month']);
        } catch (\RuntimeException $exception) {
            return response()->json(['message' => $exception->getMessage()], 422);
        }

        return response()->json(['ok' => true]);
    }

    /**
     * Mirrors the frontend's obtenerPrimerEtiqueta(): first HTML tag's text
     * content, used app-wide as the display title (devocionales have no
     * dedicated title column).
     */
    private function titleFromHtml(string $html): string
    {
        $decoded = html_entity_decode($html, ENT_QUOTES | ENT_HTML5, 'UTF-8');

        if (preg_match('/<([a-zA-Z0-9]+)[^>]*>(.*?)<\/\1>/i', $decoded, $matches)) {
            return trim(strip_tags($matches[2]));
        }

        return '';
    }

    public function downloadAudio(string $id, Request $request, TextToSpeechService $tts)
    {
        $devocional = Devocional::soloDevocionales()->findOrFail($id);
        [$lang, $voice] = $this->voiceFromRequest($request, $tts);

        $tts->generateFromHtml($devocional->contenido ?? '', $lang, $voice);
        $path = $tts->pathForHtml($devocional->contenido ?? '', $lang, $voice);

        if (! $path || ! Storage::disk('s3')->exists($path)) {
            abort(404, 'Audio no disponible');
        }

        $filename = $tts->filenameFromHtml($devocional->contenido ?? '', 'devocional');

        return Storage::disk('s3')->download($path, "{$filename}.mp3", [
            'Content-Type' => 'audio/mpeg',
        ]);
    }

    public function audioUrl(string $id, Request $request, TextToSpeechService $tts)
    {
        $devocional = Devocional::soloDevocionales()->findOrFail($id);
        [$lang, $voice] = $this->voiceFromRequest($request, $tts);

        $url = $tts->generateFromHtml($devocional->contenido ?? '', $lang, $voice);

        return response()->json(['url' => $url]);
    }

    public function downloadZip(int $month, Request $request, TextToSpeechService $tts)
    {
        abort_unless(array_key_exists($month, DevocionalAudioFolderService::MONTH_NAMES), 404);

        [$lang, $voice] = $this->voiceFromRequest($request, $tts);

        $devocionales = Devocional::inAudioFolder($month)->get();
        abort_if($devocionales->isEmpty(), 404, 'La carpeta está vacía');

        $tmpPath = tempnam(sys_get_temp_dir(), 'devocionales-zip-');
        if ($tmpPath === false) {
            throw new \RuntimeException('No se pudo crear el archivo temporal.');
        }
        $zip = new ZipArchive;
        $audioFiles = [];
        $closed = false;
        try {
            if ($zip->open($tmpPath, ZipArchive::OVERWRITE) !== true) {
                throw new \RuntimeException('No se pudo abrir el ZIP.');
            }

            $usedNames = [];

            foreach ($devocionales as $devocional) {
                $tts->generateFromHtml($devocional->contenido ?? '', $lang, $voice);
                $path = $tts->pathForHtml($devocional->contenido ?? '', $lang, $voice);

                if (! $path || ! Storage::disk('s3')->exists($path)) {
                    continue;
                }

                $baseName = sprintf('%02d-%s', $devocional->audio_folder_position, $tts->filenameFromHtml($devocional->contenido ?? '', "devocional-{$devocional->audio_folder_position}"));
                $entryName = $baseName;
                $suffix = 1;
                while (isset($usedNames[$entryName])) {
                    $entryName = "{$baseName}-{$suffix}";
                    $suffix++;
                }
                $usedNames[$entryName] = true;

                $audioFile = tempnam(sys_get_temp_dir(), 'devocional-audio-');
                if ($audioFile === false) {
                    throw new \RuntimeException('No se pudo crear el audio temporal.');
                }
                $audioFiles[] = $audioFile;
                $input = Storage::disk('s3')->readStream($path);
                $output = null;
                try {
                    $output = fopen($audioFile, 'wb');
                    if (! is_resource($input) || ! is_resource($output)
                        || stream_copy_to_stream($input, $output) === false) {
                        throw new \RuntimeException('No se pudo descargar el audio.');
                    }
                } finally {
                    if (is_resource($input)) {
                        fclose($input);
                    }
                    if (is_resource($output)) {
                        fclose($output);
                    }
                }
                if (! $zip->addFile($audioFile, "{$entryName}.mp3")) {
                    throw new \RuntimeException('No se pudo agregar el audio al ZIP.');
                }
            }

            if ($zip->numFiles === 0) {
                abort(404, 'No hay audios disponibles');
            }
            if (! $zip->close()) {
                throw new \RuntimeException('No se pudo finalizar el ZIP.');
            }
            $closed = true;

            $monthName = DevocionalAudioFolderService::MONTH_NAMES[$month];

            return response()->download($tmpPath, "{$monthName}.zip", [
                'Content-Type' => 'application/zip',
            ])->deleteFileAfterSend(true);
        } catch (\Throwable $exception) {
            if (! $closed) {
                // Release the archive before removing its source files.
                unset($zip);
            }
            @unlink($tmpPath);
            throw $exception;
        } finally {
            foreach ($audioFiles as $audioFile) {
                @unlink($audioFile);
            }
        }
    }

    /** @return array{0: string, 1: string} */
    private function voiceFromRequest(Request $request, TextToSpeechService $tts): array
    {
        $lang = (string) $request->query('lang', 'es-MX');
        $voice = (string) $request->query('voice', '');

        $valid = collect($tts->voicePairs())->first(fn (array $pair) => $pair['lang'] === $lang && $pair['voice'] === $voice);

        if (! $valid) {
            $fallback = $tts->voicePairs()[0] ?? ['lang' => 'es-MX', 'voice' => 'es-MX-DaliaNeural'];

            return [$fallback['lang'], $fallback['voice']];
        }

        return [$lang, $voice];
    }
}
