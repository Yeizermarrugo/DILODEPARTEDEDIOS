<?php

namespace Tests\Feature;

use App\Models\Devocional;
use App\Models\Ensenanza;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EnsenanzaTest extends TestCase
{
    use RefreshDatabase;

    // ── Public routes ────────────────────────────────────────────────────────

    public function test_series_page_is_accessible_to_guests(): void
    {
        $this->get('/series')->assertOk();
    }

    public function test_series_search_returns_paginated_json(): void
    {
        Ensenanza::factory()->count(3)->create();

        $this->getJson('/series-search')
            ->assertOk()
            ->assertJsonStructure(['data', 'current_page', 'last_page', 'total']);
    }

    public function test_series_episode_detail_page_is_accessible_to_guests(): void
    {
        $serie = Ensenanza::factory()->create();
        $dev   = Devocional::factory()->ensenanza()->create(['ensenanza_id' => $serie->id]);

        $this->get("/series/{$dev->id}")->assertOk();
    }

    public function test_ensenanzas_redirect_permanently_to_series(): void
    {
        $this->get('/ensenanzas')->assertRedirect('/series');
    }

    // ── Auth requirements ────────────────────────────────────────────────────

    public function test_guests_cannot_create_serie(): void
    {
        $this->post('/api/series', [
            'titulo'      => 'Test Serie',
            'slug'        => 'test-serie',
            'descripcion' => 'Descripción',
        ])->assertRedirect('/login');
    }

    public function test_guests_cannot_update_serie(): void
    {
        $serie = Ensenanza::factory()->create();

        $this->put("/api/series/{$serie->id}", [
            'titulo' => 'Nuevo título',
        ])->assertRedirect('/login');
    }

    public function test_guests_cannot_list_series_for_admin(): void
    {
        $this->get('/api/series')->assertRedirect('/login');
    }

    // ── Authenticated CRUD ───────────────────────────────────────────────────

    public function test_authenticated_user_can_create_serie(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson('/api/series', [
                'titulo'      => 'Nueva Serie',
                'descripcion' => 'Una descripción válida',
                'imagen'      => 'https://example.com/img.jpg',
            ])
            ->assertCreated();

        $this->assertDatabaseHas('ensenanzas', ['titulo' => 'Nueva Serie']);
    }

    public function test_authenticated_user_can_list_series_for_admin(): void
    {
        $user = User::factory()->create();
        Ensenanza::factory()->count(2)->create();

        $this->actingAs($user)
            ->getJson('/api/series')
            ->assertOk()
            ->assertJsonCount(2);
    }
}
