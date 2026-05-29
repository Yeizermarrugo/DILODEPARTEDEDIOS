<?php
namespace App\Http\Controllers;

use App\Rules\ValidImageContent;
use App\Traits\UsesStoragePrefix;
use Illuminate\Http\Request;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Support\Facades\Storage;

class BulkUploadController extends Controller
{
    use UsesStoragePrefix;

    public function index()
    {
        /** @var FilesystemAdapter $disk */
        $disk  = Storage::disk('s3');
        $paths = $disk->allFiles($this->storageFolder('imagenes'));

        $files = array_map(fn($path) => [
            'path' => $path,
            'url'  => $disk->url($path),
        ], $paths);

        return response()->json([
            'count' => count($files),
            'files' => $files,
        ]);
    }
    public function store(Request $request)
    {
        $request->validate([
            'files'   => 'required|array',
            'files.*' => ['required', 'image', 'mimes:jpeg,jpg,png,gif,webp', 'max:5120', new ValidImageContent()],
        ]);

        /** @var FilesystemAdapter $disk */
        $disk  = Storage::disk('s3');
        $paths = [];

        foreach ($request->file('files') as $file) {
            $path    = $disk->putFile($this->storageFolder('imagenes'), $file, [
                'visibility' => 'public',
                'CacheControl' => 'public, max-age=31536000, immutable',
            ]);
            $url     = $disk->url($path);
            $paths[] = compact('path', 'url');
        }

        return response()->json([
            'count' => count($paths),
            'files' => $paths,
        ]);
    }

    public function storeVideo(Request $request)
    {
        $request->validate([
            'file'  => 'required|file|mimetypes:video/mp4,video/webm,video/quicktime|max:204800',
            'folder' => 'sometimes|string|max:100',
        ]);

        /** @var FilesystemAdapter $disk */
        $disk   = Storage::disk('s3');
        $folder = $this->storageFolder($request->input('folder', 'videos'));
        $path   = $disk->putFile($folder, $request->file('file'), [
            'visibility' => 'public',
            'CacheControl' => 'public, max-age=31536000, immutable',
        ]);
        $url    = $disk->url($path);

        return response()->json(compact('path', 'url'));
    }
}
