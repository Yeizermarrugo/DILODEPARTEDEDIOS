<?php

namespace App\Traits;

trait UsesStoragePrefix
{
    protected function storageFolder(string $folder): string
    {
        return app()->isProduction() ? $folder : 'local/' . $folder;
    }
}
