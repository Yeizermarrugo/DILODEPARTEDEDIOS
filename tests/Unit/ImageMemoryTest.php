<?php

namespace Tests\Unit;

use App\Traits\OptimizesUploadedImages;
use PHPUnit\Framework\TestCase;

class ImageMemoryTest extends TestCase
{
    private function optimizer(): object
    {
        return new class
        {
            use OptimizesUploadedImages;

            public function run(string $bytes): array
            {
                return $this->optimizeImageBytes($bytes, 'image/png', 1600, 80);
            }
        };
    }

    public function test_large_dimensions_are_rejected_before_decoding(): void
    {
        // A PNG header alone is enough to read dimensions, without allocating pixels.
        $header = "\x89PNG\r\n\x1a\n".pack('N', 13).'IHDR'.pack('NNCCCCC', 6000, 6000, 8, 2, 0, 0, 0);
        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('dimensiones');
        $this->optimizer()->run($header);
    }

    public function test_portrait_output_is_bounded_on_both_axes(): void
    {
        $image = imagecreatetruecolor(400, 2000);
        ob_start();
        imagepng($image);
        $bytes = ob_get_clean();
        unset($image);
        $result = $this->optimizer()->run($bytes);
        $dimensions = getimagesizefromstring($result['contents']);
        $this->assertSame(320, $dimensions[0]);
        $this->assertSame(1600, $dimensions[1]);
        $this->assertSame('image/webp', $result['mime']);
    }
}
