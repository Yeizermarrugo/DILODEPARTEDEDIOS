<?php

namespace App\Traits;

use App\Rules\ValidImageContent;
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
        $dimensions = @getimagesizefromstring($contents);
        if ($dimensions === false || $dimensions[0] > ValidImageContent::MAX_DIMENSION
            || $dimensions[1] > ValidImageContent::MAX_DIMENSION
            || $dimensions[0] * $dimensions[1] > ValidImageContent::MAX_PIXELS) {
            throw new \RuntimeException('La imagen excede las dimensiones permitidas o no es válida.');
        }

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

        if (max($width, $height) > $maxWidth) {
            $targetWidth = max(1, (int) round($width * $maxWidth / max($width, $height)));
            $source = $this->resizeToWidth($source, $targetWidth, $width, $height);
        }

        return ['contents' => $this->encodeWebp($source, $quality), 'extension' => 'webp', 'mime' => 'image/webp'];
    }

    /**
     * Genera una variante más pequeña (para cards/grids) a partir de un WebP ya optimizado.
     */
    protected function makeThumbnail(string $webpContents, int $thumbWidth, int $quality = 75): string
    {
        $source = imagecreatefromstring($webpContents);

        if (! imageistruecolor($source)) {
            imagepalettetotruecolor($source);
        }
        imagealphablending($source, false);
        imagesavealpha($source, true);

        $width = imagesx($source);
        $height = imagesy($source);

        if ($width > $thumbWidth) {
            $source = $this->resizeToWidth($source, $thumbWidth, $width, $height);
        }

        return $this->encodeWebp($source, $quality);
    }

    /**
     * Deriva la key S3 del thumbnail a partir de la key del WebP full, ej.
     * "imagenes/abc.webp" -> "imagenes/abc_thumb.webp". Misma convención
     * usada al leer en el frontend, sin necesidad de guardar la URL en BD.
     */
    protected function thumbKeyFor(string $webpKey): string
    {
        return preg_replace('/\.webp$/i', '_thumb.webp', $webpKey);
    }

    private function resizeToWidth($source, int $targetWidth, int $width, int $height)
    {
        $targetHeight = max(1, (int) round($height * ($targetWidth / $width)));
        $resized = imagecreatetruecolor($targetWidth, $targetHeight);
        imagealphablending($resized, false);
        imagesavealpha($resized, true);
        imagecopyresampled($resized, $source, 0, 0, 0, 0, $targetWidth, $targetHeight, $width, $height);
        imagedestroy($source);

        return $resized;
    }

    private function encodeWebp($source, int $quality): string
    {
        ob_start();
        imagewebp($source, null, $quality);
        $contents = ob_get_clean();
        imagedestroy($source);

        return $contents;
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
