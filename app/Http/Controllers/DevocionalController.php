<?php

namespace App\Http\Controllers;

use App\Models\Devocional;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DevocionalController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {

        $perPage = $request->input('per_page', 15); // Puedes cambiar 10 por 20 si prefieres
        $devocionales = Devocional::orderBy('created_at', 'desc')->paginate($perPage);

        $categorias = Devocional::whereNotNull('categoria')
            ->where('categoria', '!=', '')
            ->groupBy('categoria')
            ->selectRaw('categoria, COUNT(*) as count')
            ->get();

        return response()->json([
            'devocionales' => $devocionales,
            'categorias' => $categorias,
        ]);
    }

    public function porCategoria(Request $request, $categoria)
    {
        $perPage = $request->input('per_page', 15);
        $devocionales = Devocional::where('categoria', $categoria)
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
        $devocionales = Devocional::orderBy('created_at', 'desc')->take(5)->get();
        return response()->json($devocionales);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        // Encuentra el devocional por ID y lo devuelve como JSON
        $devocional = Devocional::find($id);
        return Inertia::render('DevocionalDetails', [
            'devocional' => $devocional
        ]);
    }

    public function details($id)
    {
        // Encuentra el devocional por ID y lo devuelve como JSON
        $devocional = Devocional::find($id);
        return Inertia::render('DevocionalDetailsPage', [
            'devocional' => $devocional
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
            'autor' => 'nullable|string|max:255'
        ]);

        $devocional = Devocional::create([
            'contenido' => $request->input('contenido'),
            'categoria' => $request->input('categoria'),
            'imagen' => $request->input('imagen'), // Asegúrate de que 'imagen' esté en el request
            'autor' => $request->input('autor')
        ]);

        return response()->json([
            'message' => 'Devocional guardado correctamente',
            'devocional' => $devocional
        ], 201);
    }
}
