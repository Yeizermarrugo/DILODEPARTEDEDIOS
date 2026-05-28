<?php

namespace App\Traits;

trait UsesStoragePrefix
{
    protected function storageFolder(string $folder): string
    {
        $folder = trim($folder, '/');

        return app()->isProduction() ? $folder : $this->devStorageFolder($folder);
    }

    private function devStorageFolder(string $folder): string
    {
        $parts = explode('/', $folder, 2);
        $base = $parts[0];
        $rest = $parts[1] ?? null;

        return $rest ? "{$base}/dev/{$rest}" : "{$base}/dev";
    }
}
