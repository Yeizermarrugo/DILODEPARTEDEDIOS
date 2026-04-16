<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Devocional>
 */
class DevocionalFactory extends Factory
{
    public function definition(): array
    {
        return [
            'contenido' => '<h1>' . fake()->sentence(4) . '</h1><p>' . fake()->paragraph() . '</p>',
            'imagen'    => 'https://picsum.photos/800/400',
            'categoria' => fake()->randomElement(['Fe', 'Oración', 'Familia', 'Gracia']),
            'autor'     => fake()->name(),
            'is_devocional' => 1,
            'serie'     => null,
        ];
    }

    public function estudio(): static
    {
        return $this->state(['is_devocional' => 0]);
    }

    public function ensenanza(): static
    {
        return $this->state(['is_devocional' => 1, 'serie' => 'Series']);
    }
}
