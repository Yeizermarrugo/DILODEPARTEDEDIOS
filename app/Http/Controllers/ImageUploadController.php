<?php

namespace App\Http\Controllers;

use App\Models\PostImage;
use App\Rules\ValidImageContent;
use App\Traits\OptimizesUploadedImages;
use App\Traits\UsesStoragePrefix;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ImageUploadController extends Controller
{
    use UsesStoragePrefix, OptimizesUploadedImages;
    public function store(Request $request)
    {
        $request->validate([
            'file' => ['required', 'image', 'mimes:jpeg,jpg,png,gif,webp', 'max:5120', new ValidImageContent()],
        ]);

        $optimized = $this->optimizeImageForUpload($request->file('file'), maxWidth: 1600, quality: 80);

        $path = $this->storageFolder('imagenes') . '/' . Str::random(40) . '.' . $optimized['extension'];

        $stored = Storage::disk('s3')->put($path, $optimized['contents'], [
            'visibility'    => 'public',
            'CacheControl'  => 'public, max-age=31536000, immutable',
            'ContentType'   => $optimized['mime'],
        ]);

        if (! $stored) {
            return response()->json(['error' => 'Upload failed.'], 500);
        }

        $url = Storage::disk('s3')->url($path);

        return response()->json(['location' => $url]);
    }

    public function post(Request $request)
    {
        // Validar que viene el archivo
        $request->validate([
            'file' => ['required', 'image', 'mimes:jpeg,jpg,png,gif,webp', 'max:5120', new ValidImageContent()],
        ]);

        if ($request->hasFile('file')) {
            $optimized = $this->optimizeImageForUpload($request->file('file'), maxWidth: 1080, quality: 82);

            $path = $this->storageFolder('postCard') . '/' . Str::random(40) . '.' . $optimized['extension'];

            $stored = Storage::disk('s3')->put($path, $optimized['contents'], [
                'visibility'   => 'public',
                'CacheControl' => 'public, max-age=31536000, immutable',
                'ContentType'  => $optimized['mime'],
            ]);

            if (! $stored) {
                return response()->json(['error' => 'Upload failed.'], 500);
            }

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
