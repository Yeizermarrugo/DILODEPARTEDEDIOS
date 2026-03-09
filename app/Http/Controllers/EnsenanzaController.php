<?php

namespace App\Http\Controllers;

use App\Models\Devocional;
use App\Models\Ensenanza;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Carbon\Carbon;

class EnsenanzaController extends Controller
{
   public function index(Request $request)
    {
        $perPage = (int) $request->get('per_page', 10);

        $ensenanzas = Ensenanza::query()
            ->with(['devocionales' => function ($q) {
                $q->soloEnsenanzas()
                  ->select('id', 'ensenanza_id', 'autor', 'pdf', 'tiktok', 'instagram', 'contenido', 'created_at')
                    ->orderBy('created_at', 'asc');
                  
            }])
            ->withCount('devocionales') // devocionales_count
            ->paginate($perPage);

        $ensenanzas->getCollection()->transform(function ($ensenanza) {
            // Autores únicos
            $autores = $ensenanza->devocionales
                ->pluck('autor')
                ->filter()
                ->unique()
                ->values()
                ->all();

            // Devocionales simplificados (id, titulo, autor)
            $devocionales = $ensenanza->devocionales->map(function ($dev) {
                // Extraer título del contenido HTML (primer <h1> o similar)
                $titulo = preg_replace('/<[^>]+>/', '', $dev->contenido ?? '');
                return [
                    'id'     => $dev->id,
                    'titulo' => trim($titulo) ?: 'Devocional',
                    'autor'  => $dev->autor,
                    'pdf'    => $dev->pdf,
                    'tiktok' => $dev->tiktok,
                    'instagram' => $dev->instagram,
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
    //     $ensenanza = Ensenanza::with(['devocionales' => function ($q) {
    //     $q->soloEnsenanzas()
    //       ->orderBy('created_at', 'asc');
    // }])->findOrFail($id);

    $devocional = Devocional::findOrFail($id);
    $routeName = $devocional->is_devocional === 1 ? 'devocional.details' : 'estudio-biblico.details';

      $url = route($routeName, ['id' => $devocional->id]);

    return Inertia::render('DevocionalDetailsPage', [
        'devocional' => $devocional,
        'is_devocional' => $devocional->is_devocional,

        'meta' => [
            'title' => $devocional->titulo,
            'description' => Str::limit(strip_tags($devocional->contenido), 150),
            'image' => $devocional->imagen, // URL pública
            'url' => url()->current(),
        ]
    ]);
    
    }

    public function listSimple()
{
    return Ensenanza::query()
        ->select('id', 'titulo')
        ->orderBy('titulo')
        ->get();
}
}