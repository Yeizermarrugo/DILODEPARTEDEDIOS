<?php

namespace App\Http\Controllers;

use App\Models\Devocional;
use App\Models\Ensenanza;
use App\Models\PostImage;
use App\Traits\UsesStoragePrefix;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class StorageCleanupController extends Controller
{
    use UsesStoragePrefix;

    private array $baseFolders = ['imagenes', 'postCard', 'pdf', 'videos'];

    public function index()
    {
        return Inertia::render('StorageCleanup', [
            'orphaned' => $this->orphanedFiles(),
        ]);
    }

    public function destroy(Request $request)
    {
        $request->validate([
            'paths'   => 'required|array|min:1',
            'paths.*' => 'required|string',
        ]);

        /** @var FilesystemAdapter $disk */
        $disk    = Storage::disk('s3');
        $deleted = [];
        $failed  = [];

        foreach ($request->paths as $path) {
            $disk->delete($path) ? $deleted[] = $path : $failed[] = $path;
        }

        return response()->json(compact('deleted', 'failed'));
    }

    private function orphanedFiles(): array
    {
        /** @var FilesystemAdapter $disk */
        $disk = Storage::disk('s3');

        $allPaths = [];
        foreach (array_map(fn($f) => $this->storageFolder($f), $this->baseFolders) as $folder) {
            try {
                $allPaths = array_merge($allPaths, $disk->allFiles($folder));
            } catch (\Exception) {
                // Folder may not exist yet
            }
        }

        $inUse = collect()
            ->merge(Devocional::whereNotNull('imagen')->pluck('imagen'))
            ->merge(Devocional::whereNotNull('pdf')->pluck('pdf'))
            ->merge(Ensenanza::whereNotNull('imagen')->pluck('imagen'))
            ->merge(PostImage::pluck('url'))
            ->filter()
            ->unique()
            ->flip()
            ->toArray();

        $orphaned = [];
        foreach ($allPaths as $path) {
            $url = $disk->url($path);
            if (isset($inUse[$url])) {
                continue;
            }
            $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
            $orphaned[] = [
                'path'      => $path,
                'url'       => $url,
                'name'      => basename($path),
                'folder'    => dirname($path),
                'extension' => $ext,
                'is_image'  => in_array($ext, ['jpg', 'jpeg', 'png', 'gif', 'webp']),
                'is_pdf'    => $ext === 'pdf',
                'is_video'  => in_array($ext, ['mp4', 'webm', 'mov']),
            ];
        }

        return $orphaned;
    }
}
