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

        $perPage = $request->input('per_page', 16); // Puedes cambiar 10 por 20 si prefieres
        $devocionales = Devocional::where('is_devocional', true)->orderBy('created_at', 'desc')->paginate($perPage);

        $categorias = Devocional::whereNotNull('categoria')
            ->where('categoria', '!=', '')
            ->where('is_devocional', true)
            ->groupBy('categoria')
            ->selectRaw('categoria, COUNT(*) as count')
            ->get();

        $autores = Devocional::whereNotNull('autor')
            ->where('autor', '!=', '')
            ->where('is_devocional', true)
            ->groupBy('autor')
            ->selectRaw('autor, COUNT(*) as count')
            ->get();

        return response()->json([
            'devocionales' => $devocionales,
            'categorias' => $categorias,
            'autores' => $autores,
        ]);
    }

     public function searchCategories(Request $request)
    {

        $perPage = $request->input('per_page', 16); // Puedes cambiar 10 por 20 si prefieres
        $devocionales = Devocional::orderBy('created_at', 'desc')->paginate($perPage);

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

        return response()->json([
            'devocionales' => $devocionales,
            'categorias' => $categorias,
            'autores' => $autores,
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

    public function libros()
    {
        $devocionales = Devocional::where('is_devocional', false)
        ->orderBy('categoria', 'asc')
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

    // public function details($id)
    // {
    //     // Encuentra el devocional por ID y lo devuelve como JSON
    //     $devocional = Devocional::find($id);
    //     return Inertia::render('DevocionalDetailsPage', [
    //         'devocional' => $devocional,
    //         'is_devocional' => $devocional->is_devocional
    //     ]);
    // }

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
            'image' => $devocional->imagen_url, // URL pública
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
        ]);

        $devocional = Devocional::create([
            'contenido' => $request->input('contenido'),
            'categoria' => $request->input('categoria'),
            'imagen' => $request->input('imagen'), // Asegúrate de que 'imagen' esté en el request
            'autor' => $request->input('autor'),
            'is_devocional' => $request->input('is_devocional'),
        ]);

        return response()->json([
            'message' => 'Devocional guardado correctamente',
            'devocional' => $devocional
        ], 201);
    }
}
