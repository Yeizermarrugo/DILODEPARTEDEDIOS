<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Http\UploadedFile;

class ValidImageContent implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (!$value instanceof UploadedFile) {
            $fail('El archivo no es válido.');
            return;
        }

        // Verificar que PHP puede leer y procesar la imagen (magic bytes reales)
        $imageInfo = @getimagesize($value->getRealPath());

        if ($imageInfo === false) {
            $fail('El contenido del archivo no corresponde a una imagen válida.');
            return;
        }

        $allowedTypes = [IMAGETYPE_JPEG, IMAGETYPE_PNG, IMAGETYPE_GIF, IMAGETYPE_WEBP];

        if (!in_array($imageInfo[2], $allowedTypes, true)) {
            $fail('El tipo de imagen no está permitido.');
        }
    }
}
