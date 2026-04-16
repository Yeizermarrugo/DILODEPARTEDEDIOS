<?php

namespace Tests\Feature;

use App\Models\Devocional;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DevocionalTest extends TestCase
{
    use RefreshDatabase;

    // ── Public routes ────────────────────────────────────────────────────────

    public function test_devocionales_list_page_is_accessible_to_guests(): void
    {
        $this->get('/devocionales')->assertOk();
    }

    public function test_devocionales_search_returns_paginated_json(): void
    {
        Devocional::factory()->count(3)->create();

        $this->getJson('/devocionales-search')
            ->assertOk()
            ->assertJsonStructure([
                'devocionales' => ['data', 'current_page', 'last_page', 'total'],
                'categorias',
                'autores',
            ]);
    }

    public function test_devocional_details_returns_inertia_page(): void
    {
        $dev = Devocional::factory()->create();

        $this->get("/devocional/{$dev->id}")->assertOk();
    }

    // ── Auth requirements ────────────────────────────────────────────────────

    public function test_guests_cannot_create_devocional(): void
    {
        $this->post('/devocionalesadd', [
            'contenido' => '<p>Test</p>',
            'imagen'    => 'https://example.com/img.jpg',
        ])->assertRedirect('/login');
    }

    public function test_guests_cannot_update_devocional(): void
    {
        $dev = Devocional::factory()->create();

        $this->put("/devocionales/{$dev->id}", [
            'contenido' => '<p>Updated</p>',
        ])->assertRedirect('/login');
    }

    public function test_guests_cannot_access_admin_edit_list(): void
    {
        $this->get('/devocionales-edit')->assertRedirect('/login');
    }

    // ── Authenticated CRUD ───────────────────────────────────────────────────

    public function test_authenticated_user_can_create_devocional(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson('/devocionalesadd', [
                'contenido'     => '<h1>Título</h1><p>Contenido de prueba.</p>',
                'imagen'        => 'https://example.com/image.jpg',
                'categoria'     => 'Fe',
                'autor'         => 'Autor Test',
                'is_devocional' => 1,
            ])
            ->assertCreated();

        $this->assertDatabaseHas('devocionals', ['autor' => 'Autor Test']);
    }

    public function test_authenticated_user_can_update_devocional(): void
    {
        $user = User::factory()->create();
        $dev  = Devocional::factory()->create(['autor' => 'Viejo Autor']);

        $this->actingAs($user)
            ->putJson("/devocionales/{$dev->id}", [
                'contenido'     => '<h1>Nuevo</h1><p>Texto actualizado.</p>',
                'imagen'        => 'https://example.com/image.jpg',
                'categoria'     => 'Fe',
                'autor'         => 'Nuevo Autor',
                'is_devocional' => 1,
            ])
            ->assertOk();

        $this->assertDatabaseHas('devocionals', ['id' => $dev->id, 'autor' => 'Nuevo Autor']);
    }

    // ── XSS sanitization ────────────────────────────────────────────────────

    public function test_script_tags_are_stripped_on_create(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson('/devocionalesadd', [
                'contenido'     => '<p>Hola</p><script>alert("xss")</script>',
                'imagen'        => 'https://example.com/image.jpg',
                'categoria'     => 'Fe',
                'autor'         => 'Test',
                'is_devocional' => 1,
            ])
            ->assertCreated();

        $saved = Devocional::latest()->first();
        $this->assertStringNotContainsString('<script>', $saved->contenido);
    }

    public function test_script_tags_are_stripped_on_update(): void
    {
        $user = User::factory()->create();
        $dev  = Devocional::factory()->create();

        $this->actingAs($user)
            ->putJson("/devocionales/{$dev->id}", [
                'contenido'     => '<p>Texto</p><script>steal()</script>',
                'imagen'        => 'https://example.com/image.jpg',
                'categoria'     => 'Fe',
                'autor'         => 'Test',
                'is_devocional' => 1,
            ])
            ->assertOk();

        $dev->refresh();
        $this->assertStringNotContainsString('<script>', $dev->contenido);
    }

    public function test_javascript_event_handlers_are_stripped_on_save(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson('/devocionalesadd', [
                'contenido'     => '<p onclick="evil()">Click</p>',
                'imagen'        => 'https://example.com/image.jpg',
                'categoria'     => 'Fe',
                'autor'         => 'Test',
                'is_devocional' => 1,
            ])
            ->assertCreated();

        $saved = Devocional::latest()->first();
        $this->assertStringNotContainsString('onclick', $saved->contenido);
    }
}
