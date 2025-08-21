<?php

namespace App\Http\Controllers;

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
}
