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
    public function index()
    {
        // Obtiene todos los devocionales y los devuelve como JSON con paginación
        // Si necesitas paginación, puedes usar Devocional::paginate(10);
        $devocionales = Devocional::paginate(10);
        return response()->json($devocionales);
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
            'imagen' => 'required|string|url', // Asegúrate de que 'imagen' sea una cadena y tenga un tamaño máximo
        ]);

        $devocional = Devocional::create([
            'contenido' => $request->input('contenido'),
            'imagen' => $request->input('imagen') // Asegúrate de que 'imagen' esté en el request
        ]);

        return response()->json([
            'message' => 'Devocional guardado correctamente',
            'devocional' => $devocional
        ], 201);
    }
}
