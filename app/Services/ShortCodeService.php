<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ShortCodeService
{
    public function generate(): string
    {
        for ($i = 0; $i < 10; $i++) {
            $code = Str::random(8);

            $exists = DB::table('devocionals')->where('short_code', $code)->exists()
                || DB::table('ensenanzas')->where('short_code', $code)->exists();

            if (!$exists) {
                return $code;
            }
        }

        throw new \RuntimeException('No se pudo generar un short_code único tras 10 intentos.');
    }
}
