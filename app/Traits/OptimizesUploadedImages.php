<?php

namespace App\Traits;

use Illuminate\Http\UploadedFile;

trait OptimizesUploadedImages
{
    /**
     * Redimensiona (si excede $maxWidth) y convierte a WebP.
     * Los GIF se dejan intactos para no romper animaciones.
     *
     * @return array{contents: string, extension: string, mime: string}
     */
    protected function optimizeImageForUpload(UploadedFile $file, int $maxWidth, int $quality): array
    {
        return $this->optimizeImageBytes(
            file_get_contents($file->getRealPath()),
            $file->getMimeType(),
            $maxWidth,
            $quality,
            $file->getClientOriginalExtension() ?: 'bin',
        );
    }

    /**
     * @return array{contents: string, extension: string, mime: string}
     */
    protected function optimizeImageBytes(string $contents, string $mime, int $maxWidth, int $quality, string $fallbackExtension = 'bin'): array
    {
        if ($mime === 'image/gif') {
            return ['contents' => $contents, 'extension' => 'gif', 'mime' => 'image/gif'];
        }

        $source = match ($mime) {
            'image/jpeg' => imagecreatefromstring($contents),
            'image/png' => imagecreatefromstring($contents),
            'image/webp' => imagecreatefromstring($contents),
            default => null,
        };

        if (! $source) {
            return ['contents' => $contents, 'extension' => $fallbackExtension, 'mime' => $mime];
        }

        if ($mime === 'image/jpeg') {
            $source = $this->applyExifOrientation($source, $contents);
        }

        if (! imageistruecolor($source)) {
            imagepalettetotruecolor($source);
        }
        imagealphablending($source, false);
        imagesavealpha($source, true);

        $width = imagesx($source);
        $height = imagesy($source);

        if ($width > $maxWidth) {
            $targetHeight = (int) round($height * ($maxWidth / $width));
            $resized = imagecreatetruecolor($maxWidth, $targetHeight);
            imagealphablending($resized, false);
            imagesavealpha($resized, true);
            imagecopyresampled($resized, $source, 0, 0, 0, 0, $maxWidth, $targetHeight, $width, $height);
            imagedestroy($source);
            $source = $resized;
        }

        ob_start();
        imagewebp($source, null, $quality);
        $webpContents = ob_get_clean();
        imagedestroy($source);

        return ['contents' => $webpContents, 'extension' => 'webp', 'mime' => 'image/webp'];
    }

    private function applyExifOrientation($image, string $contents)
    {
        $exif = @exif_read_data('data://image/jpeg;base64,'.base64_encode($contents));
        $orientation = $exif['Orientation'] ?? 1;

        return match ($orientation) {
            3 => imagerotate($image, 180, 0),
            6 => imagerotate($image, -90, 0),
            8 => imagerotate($image, 90, 0),
            default => $image,
        };
    }
}
