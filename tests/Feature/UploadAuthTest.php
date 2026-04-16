<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class UploadAuthTest extends TestCase
{
    use RefreshDatabase;

    // ── Image upload ─────────────────────────────────────────────────────────

    public function test_guest_cannot_upload_image(): void
    {
        $this->post('/upload-image', [])->assertRedirect('/login');
    }

    public function test_upload_image_rejects_non_image_files(): void
    {
        Storage::fake('s3');

        $user = User::factory()->create();
        $file = UploadedFile::fake()->create('malware.php', 10, 'application/x-php');

        $this->actingAs($user)
            ->postJson('/upload-image', ['file' => $file])
            ->assertUnprocessable();
    }

    // ── PDF upload ───────────────────────────────────────────────────────────

    public function test_guest_cannot_upload_pdf(): void
    {
        $this->post('/upload-pdf', [])->assertRedirect('/login');
    }

    // ── Bulk upload (API) ────────────────────────────────────────────────────

    public function test_guest_cannot_access_bulk_upload(): void
    {
        $this->postJson('/api/bulk-upload', [])->assertUnauthorized();
    }

    public function test_guest_cannot_access_bulk_upload_video(): void
    {
        $this->postJson('/api/bulk-upload/video', [])->assertUnauthorized();
    }

    public function test_guest_cannot_list_bucket_images(): void
    {
        $this->getJson('/api/bucket/images')->assertUnauthorized();
    }
}
