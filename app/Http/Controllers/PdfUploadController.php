<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PdfUploadController extends Controller
{
    public function store(Request $request)
    {
        // Validar que viene un PDF
        $request->validate([
            'file' => 'required|mimes:pdf|max:10240', // 10MB máximo
        ]);

        if ($request->hasFile('file')) {
            // Subir a S3 en carpeta "pdfs-devocionales"
            $path = $request->file('file')->store('pdf', 's3', 'public');
            $url = Storage::disk('s3')->url($path);

            return response()->json([
                'location' => $url,
            ]);
        }

        return response()->json(['error' => 'No file uploaded.'], 400);
    }
}