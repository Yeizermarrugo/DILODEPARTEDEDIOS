<?php

namespace App\Http\Controllers;

use App\Traits\UsesStoragePrefix;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PdfUploadController extends Controller
{
    use UsesStoragePrefix;
    public function store(Request $request)
    {
        // Validar que viene un PDF
        $request->validate([
            'file' => 'required|mimes:pdf|max:10240', // 10MB máximo
        ]);

        if ($request->hasFile('file')) {
            // Subir a S3 en carpeta "pdfs-devocionales"
            $path = Storage::disk('s3')->putFile($this->storageFolder('pdf'), $request->file('file'), [
                'visibility' => 'public',
                'CacheControl' => 'public, max-age=31536000, immutable',
            ]);
            $url = Storage::disk('s3')->url($path);

            return response()->json([
                'location' => $url,
            ]);
        }

        return response()->json(['error' => 'No file uploaded.'], 400);
    }
}
