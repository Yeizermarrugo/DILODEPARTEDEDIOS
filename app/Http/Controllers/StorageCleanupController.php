<?php

namespace App\Http\Controllers;

use App\Models\Devocional;
use App\Models\Ensenanza;
use App\Models\PostImage;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class StorageCleanupController extends Controller
{
    /** @var string[] */
    private array $baseFolders = ['imagenes', 'postCard', 'pdf', 'videos'];

    public function index()
    {
        return Inertia::render('StorageCleanup');
    }

    public function orphaned()
    {
        return response()->json($this->orphanedFiles());
    }

    public function destroy(Request $request)
    {
        $request->validate([
            'paths'   => 'required|array|min:1',
            'paths.*' => 'required|string',
        ]);

        $allowedFolders = $this->prefixedFolders();
        $paths          = $request->paths;

        // Reject any path not rooted in a known env-prefixed folder
        foreach ($paths as $path) {
            $valid = false;
            foreach ($allowedFolders as $folder) {
                if (str_starts_with($path, $folder . '/')) {
                    $valid = true;
                    break;
                }
            }
            if (!$valid) {
                return back()->withErrors(['paths' => "Path not allowed: {$path}"]);
            }
        }

        /** @var FilesystemAdapter $disk */
        $disk    = Storage::disk('s3');
        $deleted = 0;

        foreach ($paths as $path) {
            if ($disk->delete($path)) {
                $deleted++;
            }
        }

        return redirect()->route('storage.cleanup')
            ->with('deleted', $deleted);
    }

    // ─────────────────────────────────────────────────────────────

    private function storageFolder(string $folder): string
    {
        return app()->isProduction() ? $folder : 'local/' . $folder;
    }

    /** @return string[] */
    private function prefixedFolders(): array
    {
        return array_map(fn($f) => $this->storageFolder($f), $this->baseFolders);
    }

    /** @return array<int, array<string, mixed>> */
    private function orphanedFiles(): array
    {
        /** @var FilesystemAdapter $disk */
        $disk    = Storage::disk('s3');
        $baseUrl = rtrim((string) config('filesystems.disks.s3.url', ''), '/');

        // ── 1. Collect all bucket paths in env folders ──────────
        $allPaths = [];
        foreach ($this->prefixedFolders() as $folder) {
            try {
                $allPaths = array_merge($allPaths, $disk->allFiles($folder));
            } catch (\Throwable) {
                // folder not created yet
            }
        }

        if (empty($allPaths)) {
            return [];
        }

        // ── 2. Build set of in-use paths ────────────────────────
        // Helper: strip base URL → path key for comparison
        $toPath = function (?string $url) use ($baseUrl): ?string {
            if (!$url || !$baseUrl) {
                return null;
            }
            $prefix = $baseUrl . '/';
            if (str_starts_with($url, $prefix)) {
                return substr($url, strlen($prefix));
            }
            return null;
        };

        // Direct column references
        $directUrls = collect()
            ->merge(Devocional::whereNotNull('imagen')->pluck('imagen'))
            ->merge(Devocional::whereNotNull('pdf')->pluck('pdf'))
            ->merge(Ensenanza::whereNotNull('imagen')->pluck('imagen'))
            ->merge(PostImage::pluck('url'));

        // URLs embedded inside TinyMCE HTML (covers images & videos inserted in contenido)
        if ($baseUrl) {
            $pattern  = '/' . preg_quote($baseUrl . '/', '/') . '[^\s"\'<>()]+/';
            $contents = Devocional::whereNotNull('contenido')
                ->where('contenido', 'LIKE', '%' . $baseUrl . '%')
                ->pluck('contenido');

            foreach ($contents as $html) {
                if (preg_match_all($pattern, $html, $m)) {
                    $directUrls = $directUrls->merge($m[0]);
                }
            }
        }

        $inUsePaths = $directUrls
            ->map($toPath)
            ->filter()
            ->unique()
            ->flip()
            ->toArray();

        // ── 3. Find orphans ─────────────────────────────────────
        $orphaned = [];
        foreach ($allPaths as $path) {
            if (isset($inUsePaths[$path])) {
                continue;
            }
            $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
            $orphaned[] = [
                'path'      => $path,
                'url'       => $disk->url($path),
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
