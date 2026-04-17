<?php

namespace App\Http\Controllers;

use App\Models\PostImage;
use App\Rules\ValidImageContent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ImageUploadController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'file' => ['required', 'image', 'mimes:jpeg,jpg,png,gif,webp', 'max:5120', new ValidImageContent()],
        ]);

        $path = $request->file('file')->store('imagenes', 's3', 'public');
        $url  = Storage::disk('s3')->url($path);

        return response()->json(['location' => $url]);
    }

    public function post(Request $request)
    {
        // Validar que viene el archivo
        $request->validate([
            'file' => ['required', 'image', 'mimes:jpeg,jpg,png,gif,webp', 'max:5120', new ValidImageContent()],
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
