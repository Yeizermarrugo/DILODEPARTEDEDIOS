<?php

namespace Tests\Feature;

use App\Models\ContentLike;
use App\Models\Devocional;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LikeTest extends TestCase
{
    use RefreshDatabase;

    // ── GET /api/likes/{type}/{id} ───────────────────────────────────────────

    public function test_get_likes_returns_total_and_liked_status(): void
    {
        $dev = Devocional::factory()->create();

        $this->getJson("/api/likes/devocional/{$dev->id}")
            ->assertOk()
            ->assertJsonStructure(['total', 'liked']);
    }

    public function test_get_likes_returns_zero_for_new_content(): void
    {
        $dev = Devocional::factory()->create();

        $response = $this->getJson("/api/likes/devocional/{$dev->id}")
            ->assertOk();

        $this->assertEquals(0, $response->json('total'));
        $this->assertFalse($response->json('liked'));
    }

    public function test_invalid_type_returns_error(): void
    {
        $dev = Devocional::factory()->create();

        $this->getJson("/api/likes/invalid/{$dev->id}")->assertUnprocessable();
    }

    // ── POST /api/likes/{type}/{id} ──────────────────────────────────────────

    public function test_toggle_like_adds_like(): void
    {
        $dev = Devocional::factory()->create();

        // Use withCredentials so cookies are sent with JSON requests
        $this->withCredentials()
            ->withUnencryptedCookie('visitor_id', 'visitor-abc')
            ->postJson("/api/likes/devocional/{$dev->id}")
            ->assertOk()
            ->assertJsonPath('liked', true);

        $this->assertDatabaseHas('content_likes', [
            'content_id'   => $dev->id,
            'content_type' => ContentLike::TYPE_DEVOCIONAL,
        ]);
    }

    public function test_same_visitor_liking_twice_removes_like(): void
    {
        $dev = Devocional::factory()->create();

        $this->withCredentials()->withUnencryptedCookie('visitor_id', 'visitor-abc')
            ->postJson("/api/likes/devocional/{$dev->id}")
            ->assertJsonPath('liked', true);

        $this->withCredentials()->withUnencryptedCookie('visitor_id', 'visitor-abc')
            ->postJson("/api/likes/devocional/{$dev->id}")
            ->assertOk()
            ->assertJsonPath('liked', false);
    }

    public function test_like_total_reflects_database_records(): void
    {
        $dev = Devocional::factory()->create();

        // Simulate 3 distinct visitors having liked
        ContentLike::insert([
            ['content_id' => $dev->id, 'content_type' => 'devocional', 'visitor_hash' => 'hash1', 'ip_segment' => '1.2.3.0', 'created_at' => now()],
            ['content_id' => $dev->id, 'content_type' => 'devocional', 'visitor_hash' => 'hash2', 'ip_segment' => '1.2.4.0', 'created_at' => now()],
            ['content_id' => $dev->id, 'content_type' => 'devocional', 'visitor_hash' => 'hash3', 'ip_segment' => '1.2.5.0', 'created_at' => now()],
        ]);

        $response = $this->getJson("/api/likes/devocional/{$dev->id}")
            ->assertOk();

        $this->assertEquals(3, $response->json('total'));
    }

    // ── Likes for different content types ────────────────────────────────────

    public function test_estudio_likes_are_tracked_separately(): void
    {
        $estudio = Devocional::factory()->estudio()->create();

        $this->withCredentials()->withUnencryptedCookie('visitor_id', 'visitor-abc')
            ->postJson("/api/likes/estudio/{$estudio->id}")
            ->assertOk()
            ->assertJsonPath('liked', true);

        $this->assertDatabaseHas('content_likes', [
            'content_id'   => $estudio->id,
            'content_type' => ContentLike::TYPE_ESTUDIO,
        ]);
    }
}
