<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DevocionalsUuidSeeder extends Seeder
{
    public function run()
    {
        $devocionals = DB::table('devocionals')->get();
        foreach ($devocionals as $devocional) {
            DB::table('devocionals')
                ->where('id', $devocional->id)
                ->update(['id' => (string) Str::uuid()]);
        }
    }
}
