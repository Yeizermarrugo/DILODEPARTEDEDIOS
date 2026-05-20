<?php

namespace App\Http\Controllers;

use App\Models\Devocional;
use App\Models\Ensenanza;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Support\Str;

class EnsenanzaController extends Controller
{

    public function index(Request $request)
    {
        $perPage = (int) $request->get('per_page', 10);

        $ensenanzas = Ensenanza::query()
            ->with(['devocionales' => function ($q) {
                // Include all episodes (both visible and hidden); hidden ones render as "Próximamente" rows
                $q->where('is_devocional', Devocional::TYPE_SERIE)
                    ->select('id', 'ensenanza_id', 'autor', 'pdf', 'tiktok', 'instagram', 'contenido', 'created_at', 'is_devocional', 'hidden', 'views_count')
                    ->orderBy('created_at', 'asc');
            }])
            ->withCount('devocionales')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        $ensenanzas->getCollection()->transform(function ($ensenanza) {
            // Autores únicos
            $autores = $ensenanza->devocionales
                ->pluck('autor')
                ->filter()
                ->unique()
                ->values()
                ->all();

            // Devocionales simplificados
            $devocionales = $ensenanza->devocionales->map(function ($dev) {
                $contenido = $dev->contenido ?? '';

                $contenido = $dev->contenido ?? '';

                if (preg_match('/<h2[^>]*>(.*?)<\/h2>/is', $contenido, $matches)) {
                    $titulo = $matches[1];
                } else {
                    $titulo = strip_tags($contenido);
                }

                // 1. Quitar etiquetas
                $titulo = strip_tags($titulo);

                // 2. Decodificar entidades HTML (&Oacute; -> Ó, &nbsp; -> espacio, etc.)
                $titulo = html_entity_decode($titulo, ENT_QUOTES | ENT_HTML5, 'UTF-8');

                // 3. Normalizar espacios
                $titulo = preg_replace('/\s+/u', ' ', trim($titulo));

                // 4. Limitar longitud
                $titulo = Str::limit($titulo, 120);


                return [
                    'id'         => $dev->id,
                    'titulo'     => $titulo ?: 'Devocional',
                    'autor'      => $dev->autor,
                    'contenido'  => $dev->contenido,
                    'pdf'        => $dev->pdf,
                    'tiktok'     => $dev->tiktok,
                    'instagram'  => $dev->instagram,
                    'hidden'     => (bool) $dev->hidden,
                    'views_count' => $dev->views_count ?? 0,
                ];
            })->values()->all();

            return [
                'id'               => $ensenanza->id,
                'slug'             => $ensenanza->slug,
                'titulo'           => $ensenanza->titulo,
                'descripcion'      => $ensenanza->descripcion,
                'imagen'           => $ensenanza->imagen,
                'ensenanzas_count' => $ensenanza->devocionales_count,
                'pdf'              => $ensenanza->pdf,
                'tiktok'           => $ensenanza->tiktok,
                'instagram'        => $ensenanza->instagram,
                'autores'          => $autores,
                'devocionales'     => $devocionales,
            ];
        });

        return response()->json($ensenanzas);
    }

    public function details($id)
    {
        $devocional = Devocional::with('ensenanza')->findOrFail($id);

        $seriesNav = null;

        if ($devocional->ensenanza_id) {
            $allEpisodes = Devocional::where('ensenanza_id', $devocional->ensenanza_id)
                ->where('is_devocional', Devocional::TYPE_SERIE)
                ->orderBy('created_at', 'asc')
                ->get(['id', 'hidden', 'created_at', DB::raw('SUBSTRING(contenido, 1, 500) as contenido')])
                ->values();

            $currentIdx = $allEpisodes->search(fn ($ep) => $ep->id === $devocional->id);

            if ($currentIdx !== false) {
                $extractTitle = function ($dev) {
                    $contenido = $dev->contenido ?? '';
                    if (preg_match('/<h2[^>]*>(.*?)<\/h2>/is', $contenido, $m)) {
                        $titulo = $m[1];
                    } elseif (preg_match('/<h1[^>]*>(.*?)<\/h1>/is', $contenido, $m)) {
                        $titulo = $m[1];
                    } else {
                        $titulo = strip_tags($contenido);
                    }
                    $titulo = strip_tags($titulo);
                    $titulo = html_entity_decode($titulo, ENT_QUOTES | ENT_HTML5, 'UTF-8');
                    $titulo = preg_replace('/\s+/u', ' ', trim($titulo));
                    return Str::limit($titulo, 80) ?: 'Episodio';
                };

                $prevEp = $currentIdx > 0 ? $allEpisodes[$currentIdx - 1] : null;
                $nextEp = $currentIdx < $allEpisodes->count() - 1 ? $allEpisodes[$currentIdx + 1] : null;

                $seriesNav = [
                    'serie_titulo' => $devocional->ensenanza?->titulo ?? '',
                    'serie_id'     => $devocional->ensenanza_id,
                    'position'     => $currentIdx + 1,
                    'total'        => $allEpisodes->count(),
                    'prev'         => $prevEp ? [
                        'id'         => $prevEp->id,
                        'titulo'     => $extractTitle($prevEp),
                        'visible'    => !$prevEp->hidden,
                        'publish_at' => $prevEp->created_at->toISOString(),
                    ] : null,
                    'next'         => $nextEp ? [
                        'id'         => $nextEp->id,
                        'titulo'     => $extractTitle($nextEp),
                        'visible'    => !$nextEp->hidden,
                        'publish_at' => $nextEp->created_at->toISOString(),
                    ] : null,
                ];
            }
        }

        return Inertia::render('DevocionalDetailsPage', [
            'devocional'    => $devocional,
            'is_devocional' => $devocional->is_devocional,
            'like_type'     => 'ensenanza',
            'series_nav'    => $seriesNav,
            'meta'          => [
                'title'       => $devocional->titulo,
                'description' => Str::limit(strip_tags($devocional->contenido), 150),
                'image'       => $devocional->imagen,
                'url'         => url()->current(),
            ],
        ]);
    }

    public function listSimple()
    {
        return Ensenanza::query()
            ->select('id', 'titulo')
            ->orderBy('titulo')
            ->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'titulo'      => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'imagen'      => 'nullable|string|url',
        ]);

        // Generar slug base
        $slugBase = Str::slug($data['titulo']);
        $slug = $slugBase;

        // Lógica para garantizar que el slug sea único
        $count = 1;
        while (\App\Models\Ensenanza::where('slug', $slug)->exists()) {
            $slug = $slugBase . '-' . $count;
            $count++;
        }

        $ensenanza = Ensenanza::create([
            'titulo'      => $data['titulo'],
            'slug'        => $slug,
            'descripcion' => $data['descripcion'] ?? '',
            'imagen'      => $data['imagen'] ?? null,
        ]);

        return response()->json($ensenanza, 201);
    }

    public function update(Request $request, $id)
    {
        $ensenanza = Ensenanza::findOrFail($id);

        $data = $request->validate([
            'titulo'      => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'imagen'      => 'nullable|string|url',
        ]);

        $ensenanza->update([
            'titulo'      => $data['titulo'],
            'slug'        => Str::slug($data['titulo']),
            'descripcion' => $data['descripcion'] ?? '',
            'imagen'      => $data['imagen'] ?? $ensenanza->imagen,
        ]);

        return response()->json($ensenanza);
    }
}