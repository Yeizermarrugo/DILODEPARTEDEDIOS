<?php

namespace Tests\Feature;

use App\Http\Controllers\DevocionalAudioFolderController;
use App\Models\Devocional;
use App\Services\TextToSpeechService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Mockery;
use Tests\TestCase;
use ZipArchive;

class AudioZipMemoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_zip_streams_audio_and_removes_source_temporaries(): void
    {
        Devocional::factory()->create(['audio_folder_month' => 1, 'audio_folder_position' => 1]);
        $tts = Mockery::mock(TextToSpeechService::class);
        $tts->shouldReceive('voicePairs')->andReturn([['lang' => 'es-MX', 'voice' => 'test']]);
        $tts->shouldReceive('generateFromHtml')->once()->andReturn('https://example.test/audio.mp3');
        $tts->shouldReceive('pathForHtml')->once()->andReturn('audio.mp3');
        $tts->shouldReceive('filenameFromHtml')->once()->andReturn('prueba');
        $disk = Mockery::mock();
        Storage::shouldReceive('disk')->with('s3')->andReturn($disk);
        $disk->shouldReceive('exists')->with('audio.mp3')->andReturnTrue();
        $disk->shouldReceive('readStream')->with('audio.mp3')->once()->andReturnUsing(function () {
            $stream = fopen('php://temp', 'w+b');
            fwrite($stream, 'audio-test');
            rewind($stream);

            return $stream;
        });
        $before = glob(sys_get_temp_dir().'/devocional-audio-*');
        $response = (new DevocionalAudioFolderController)->downloadZip(1, Request::create('/'), $tts);
        $path = $response->getFile()->getPathname();
        try {
            $zip = new ZipArchive;
            $this->assertTrue($zip->open($path));
            $this->assertSame('audio-test', $zip->getFromName('01-prueba.mp3'));
            $zip->close();
            $this->assertSame($before, glob(sys_get_temp_dir().'/devocional-audio-*'));
        } finally {
            unlink($path);
        }
    }

    public function test_failed_download_cleans_up_zip_and_audio_files(): void
    {
        Devocional::factory()->create(['audio_folder_month' => 1, 'audio_folder_position' => 1]);
        $tts = Mockery::mock(TextToSpeechService::class);
        $tts->shouldReceive('voicePairs')->andReturn([['lang' => 'es-MX', 'voice' => 'test']]);
        $tts->shouldReceive('generateFromHtml')->andReturn('https://example.test/audio.mp3');
        $tts->shouldReceive('pathForHtml')->andReturn('audio.mp3');
        $tts->shouldReceive('filenameFromHtml')->andReturn('prueba');
        $disk = Mockery::mock();
        Storage::shouldReceive('disk')->with('s3')->andReturn($disk);
        $disk->shouldReceive('exists')->andReturnTrue();
        $disk->shouldReceive('readStream')->andReturn(false);
        $before = glob(sys_get_temp_dir().'/devocional*');
        try {
            (new DevocionalAudioFolderController)->downloadZip(1, Request::create('/'), $tts);
            $this->fail('Expected a failed download');
        } catch (\RuntimeException $exception) {
            $this->assertSame('No se pudo descargar el audio.', $exception->getMessage());
        }
        $this->assertSame($before, glob(sys_get_temp_dir().'/devocional*'));
    }
}
