<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class BulkUploadController extends Controller
{
      public function index()
    {
        // Lista recursiva de todos los archivos dentro de "imagenes"
        $paths = Storage::disk('s3')->allFiles('imagenes');

        // Mapear a URLs públicas
        $files = array_map(function ($path) {
            return [
                'path' => $path,
                'url'  => Storage::disk('s3')->url($path),
            ];
        }, $paths);

        return response()->json([
            'count' => count($files),
            'files' => $files,
        ]);
    }
    public function store(Request $request)
    {
        $request->validate([
            'files'   => 'required|array',
            'files.*' => 'required|image|max:5120',
        ]);

        $paths = [];

        foreach ($request->file('files') as $file) {
            $path = $file->store('imagenes', 's3');
            $url  = Storage::disk('s3')->url($path);
            $paths[] = compact('path', 'url');
        }

        return response()->json([
            'count' => count($paths),
            'files' => $paths,
        ]);
    }
}
