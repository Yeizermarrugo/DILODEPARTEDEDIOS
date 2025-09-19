<?php

namespace App\Http\Controllers;

use App\Models\PostImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ImageUploadController extends Controller
{
    public function store(Request $request)
    {
        if ($request->hasFile('file')) {
            // Subir a S3 en la carpeta "imagenes"
            $path = $request->file('file')->store('imagenes', 's3', 'public');

            // Obtener la URL pública
            $url = Storage::disk('s3')->url($path);

            // Aquí puedes guardar $url donde quieras, por ejemplo en tu configuración, archivo, etc.
            return response()->json(['location' => $url]);
        }
        return response()->json(['error' => 'No file uploaded.'], 400);
    }

    public function post(Request $request)
    {
        // Validar que viene el archivo
        $request->validate([
            'file' => 'required|image|max:5120', // 5MB máximo
        ]);

        if ($request->hasFile('file')) {
            // Subir a S3 en carpeta devocionales
            $path = $request->file('file')->store('postCard', 's3', 'public');
            $url = Storage::disk('s3')->url($path);

            // Guardar en BD
            $imagen = PostImage::create([
                'url' => $url,
            ]);

            return response()->json([
                'location' => $url,
                'id' => $imagen->id,
                'created_at' => $imagen->created_at,
            ]);
        }
        return response()->json(['error' => 'No file uploaded.'], 400);
    }
}
