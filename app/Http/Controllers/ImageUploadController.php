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

        $path = Storage::disk('s3')->putFile('imagenes', $request->file('file'), [
            'visibility'    => 'public',
            'CacheControl'  => 'max-age=31536000, public',
        ]);
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
            $path = Storage::disk('s3')->putFile('postCard', $request->file('file'), [
                'visibility'   => 'public',
                'CacheControl' => 'max-age=31536000, public',
            ]);
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
