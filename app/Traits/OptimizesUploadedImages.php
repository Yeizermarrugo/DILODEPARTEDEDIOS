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
        $mime = $file->getMimeType();
        $path = $file->getRealPath();

        if ($mime === 'image/gif') {
            return [
                'contents' => file_get_contents($path),
                'extension' => 'gif',
                'mime' => 'image/gif',
            ];
        }

        $source = match ($mime) {
            'image/jpeg' => imagecreatefromjpeg($path),
            'image/png' => imagecreatefrompng($path),
            'image/webp' => imagecreatefromwebp($path),
            default => null,
        };

        if (! $source) {
            return [
                'contents' => file_get_contents($path),
                'extension' => $file->getClientOriginalExtension() ?: 'bin',
                'mime' => $mime,
            ];
        }

        if ($mime === 'image/jpeg') {
            $source = $this->applyExifOrientation($source, $path);
        }

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
        $contents = ob_get_clean();
        imagedestroy($source);

        return [
            'contents' => $contents,
            'extension' => 'webp',
            'mime' => 'image/webp',
        ];
    }

    private function applyExifOrientation($image, string $path)
    {
        $exif = @exif_read_data($path);
        $orientation = $exif['Orientation'] ?? 1;

        return match ($orientation) {
            3 => imagerotate($image, 180, 0),
            6 => imagerotate($image, -90, 0),
            8 => imagerotate($image, 90, 0),
            default => $image,
        };
    }
}
