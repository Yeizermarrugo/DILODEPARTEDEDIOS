<?php

namespace App\Http\Controllers;

use App\Models\Devocional;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class DevocionalController extends Controller
{
    /**
     * Display a listing of the resource.
     */
   public function index(Request $request)
{
    $perPage = $request->input('per_page', 16);
    $devocionales = Devocional::where('is_devocional', true)
        ->orderBy('created_at', 'desc')
        ->paginate($perPage);

    $categoriasRaw = Devocional::whereNotNull('categoria')
        ->where('categoria', '!=', '')
        ->where('is_devocional', true)
        ->selectRaw('categoria, serie, COUNT(*) as count')
        ->groupBy('categoria', 'serie')
        ->get();

    $series = [];
    $categoriasSinSerie = [];

    foreach ($categoriasRaw as $row) {
        if ($row->serie) {
            if (!isset($series[$row->serie])) {
                $series[$row->serie] = [
                    'nombre'     => $row->serie,
                    'categorias' => [],
                ];
            }
            $series[$row->serie]['categorias'][] = [
                'categoria' => $row->categoria,
                'count'     => $row->count,
            ];
        } else {
            $categoriasSinSerie[] = [
                'categoria' => $row->categoria,
                'count'     => $row->count,
            ];
        }
    }

    $autores = Devocional::whereNotNull('autor')
        ->where('autor', '!=', '')
        ->where('is_devocional', true)
        ->groupBy('autor')
        ->selectRaw('autor, COUNT(*) as count')
        ->get();

    return response()->json([
        'devocionales' => $devocionales,
        'categorias'   => $categoriasSinSerie,
        'series'       => array_values($series),
        'autores'      => $autores,
    ]);
}

public function searchCategories(Request $request)
{
    $perPage = $request->input('per_page', 16);
    $devocionales = Devocional::orderBy('created_at', 'desc')->paginate($perPage);

    // Todas las categorías con su serie
    $categoriasRaw = Devocional::whereNotNull('categoria')
        ->where('categoria', '!=', '')
        ->selectRaw('categoria, serie, COUNT(*) as count')
        ->groupBy('categoria', 'serie')
        ->get();

    // Agrupar en estructura series + categorias sueltas
    $series = [];
    $categoriasSinSerie = [];

    foreach ($categoriasRaw as $row) {
        if ($row->serie) {
            // Dentro de una serie
            if (!isset($series[$row->serie])) {
                $series[$row->serie] = [
                    'nombre'     => $row->serie,
                    'categorias' => [],
                ];
            }
            $series[$row->serie]['categorias'][] = [
                'categoria' => $row->categoria,
                'count'     => $row->count,
            ];
        } else {
            // Categoría suelta
            $categoriasSinSerie[] = [
                'categoria' => $row->categoria,
                'count'     => $row->count,
            ];
        }
    }

    $autores = Devocional::whereNotNull('autor')
        ->where('autor', '!=', '')
        ->groupBy('autor')
        ->selectRaw('autor, COUNT(*) as count')
        ->get();

    return response()->json([
        'devocionales'       => $devocionales,
        'categorias'         => $categoriasSinSerie, // lo que ya usas
        'series'             => array_values($series), // nuevo
        'autores'            => $autores,
    ]);
}


    public function porCategoria(Request $request, $categoria)
    {
        $perPage = $request->input('per_page', 16);
        $devocionales = Devocional::where('categoria', $categoria)
            ->where('is_devocional', true)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json([
            'devocionales' => $devocionales,
            'categoria' => $categoria
        ]);
    }
    //devolver los ultimos 5 devocionales
    public function latest()
    {
        $devocionales = Devocional::orderBy('created_at', 'desc')->where('is_devocional', true)->take(5)->get();
        return response()->json($devocionales);
    }

    public function estudios()
    {
        $devocionales = Devocional::where('is_devocional', false)
        ->orderBy('categoria', 'asc')
        ->orderBy('contenido', 'asc')
        ->orderBy('created_at', 'asc')
        ->get();
        return response()->json($devocionales);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $devocional = Devocional::find($id);
        if (!$devocional) {
            abort(404);
        }
        return Inertia::render('DevocionalDetails', [
            'devocional' => $devocional,
            'is_devocional' => $devocional->is_devocional
        ]);
    }

    public function details($id)
{
    $devocional = Devocional::findOrFail($id);

    return Inertia::render('DevocionalDetailsPage', [
        'devocional' => $devocional,
        'is_devocional' => $devocional->is_devocional,

        // 👇 ESTO ES LO NUEVO
        'meta' => [
            'title' => $devocional->titulo,
            'description' => Str::limit(strip_tags($devocional->contenido), 150),
            'image' => $devocional->imagen, // URL pública
            'url' => url()->current(),
        ]
    ]);
}


    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        Devocional::create([
            'contenido' => $request->input('contenido')
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'contenido' => 'required|string',
            'categoria' => 'required|string',
            'imagen' => 'required|string|url', // Asegúrate de que 'imagen' sea una cadena y tenga un tamaño máximo
            'autor' => 'nullable|string|max:255',
            'is_devocional' => 'required|boolean',
            'serie' => 'nullable|string|max:255',
        ]);

        $devocional = Devocional::create([
            'contenido' => $request->input('contenido'),
            'categoria' => $request->input('categoria'),
            'imagen' => $request->input('imagen'), // Asegúrate de que 'imagen' esté en el request
            'autor' => $request->input('autor'),
            'is_devocional' => $request->input('is_devocional'),
            'serie' => $request->input('serie'),
        ]);

        return response()->json([
            'message' => 'Devocional guardado correctamente',
            'devocional' => $devocional
        ], 201);
    }

public function adminIndex(Request $request)
{
    $perPage   = $request->input('per_page', 50);
    $search    = $request->input('search');
    $categoria = $request->input('categoria');
    $autor     = $request->input('autor');

    // Base query con filtros comunes
    $baseQuery = Devocional::query();

    if ($search) {
        $baseQuery->where(function ($q) use ($search) {
            $q->where('contenido', 'like', "%{$search}%")
              ->orWhere('categoria', 'like', "%{$search}%");
        });
    }

    if ($categoria) {
        $baseQuery->where('categoria', $categoria);
    }

    if ($autor) {
        $baseQuery->where('autor', $autor);
    }

    // Clonar la query base para cada grupo
    $devocionales = (clone $baseQuery)
        ->where('is_devocional', true)
        ->orderBy('created_at', 'desc')
        ->paginate($perPage, ['*'], 'devocionales_page')
        ->withQueryString();

    $estudios = (clone $baseQuery)
        ->where('is_devocional', false)
        ->orderBy('created_at', 'desc')
        ->paginate($perPage, ['*'], 'estudios_page')
        ->withQueryString();

    $categorias = Devocional::whereNotNull('categoria')
        ->where('categoria', '!=', '')
        ->groupBy('categoria')
        ->selectRaw('categoria, COUNT(*) as count')
        ->get();

    $autores = Devocional::whereNotNull('autor')
        ->where('autor', '!=', '')
        ->groupBy('autor')
        ->selectRaw('autor, COUNT(*) as count')
        ->get();

    return Inertia::render('Edit', [
        'devocionales' => $devocionales,   // is_devocional = true
        'estudios'     => $estudios,       // is_devocional = false
        'categorias'   => $categorias,
        'autores'      => $autores,
        'filters'      => [
            'search'    => $search,
            'categoria' => $categoria,
            'autor'     => $autor,
        ],
    ]);
}


public function showJson($id)
{
    $devocional = Devocional::findOrFail($id);
    return response()->json($devocional);
}

public function update(Request $request, $id)
{
    $devocional = Devocional::findOrFail($id);

    $request->validate([
        'contenido'     => 'required|string',
        'categoria'     => 'required|string',
        'imagen'        => 'required|string|url',
        'autor'         => 'nullable|string|max:255',
        'is_devocional' => 'required|boolean',
        'serie'         => 'nullable|string|max:255',
    ]);

    $devocional->update([
        'contenido'     => $request->input('contenido'),
        'categoria'     => $request->input('categoria'),
        'imagen'        => $request->input('imagen'),
        'autor'         => $request->input('autor'),
        'is_devocional' => $request->input('is_devocional'),
        'serie'         => $request->input('serie'),
    ]);

    return response()->json([
        'message'     => 'Devocional actualizado correctamente',
        'devocional'  => $devocional,
    ]);
}

}