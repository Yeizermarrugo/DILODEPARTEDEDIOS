<?php

namespace App\Http\Controllers;

use App\Models\PostImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PostController extends Controller
{
    public function index(Request $request)
    {
        $images = PostImage::orderBy('created_at', 'desc')->take(10)->get();
        return response()->json($images);
    }

    public function delete($id)
    {
        $image = PostImage::find($id);
        if ($image) {
            // Extraer la ruta del archivo desde la URL
            $parsedUrl = parse_url($image->url);
            $path = ltrim($parsedUrl['path'], '/');

            // Eliminar el archivo de S3
            Storage::disk('s3')->delete($path);

            // Eliminar el registro de la base de datos
            $image->delete();

            return response()->json(['message' => 'Imagen eliminada correctamente.']);
        }
        return response()->json(['error' => 'Imagen no encontrada.'], 404);
    }
}
