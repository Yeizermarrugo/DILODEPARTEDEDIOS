<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Ensenanza>
 */
class EnsenanzaFactory extends Factory
{
    public function definition(): array
    {
        $titulo = fake()->sentence(3, false);

        return [
            'slug'        => Str::slug($titulo) . '-' . fake()->unique()->numberBetween(1000, 9999),
            'titulo'      => $titulo,
            'descripcion' => fake()->paragraph(),
            'imagen'      => 'https://picsum.photos/800/400',
        ];
    }
}
