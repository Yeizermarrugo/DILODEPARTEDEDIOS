<?php

namespace App\Console\Commands;

use App\Models\Devocional;
use App\Models\Ensenanza;
use App\Models\PostImage;
use App\Traits\OptimizesUploadedImages;
use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class BackfillOptimizedImages extends Command
{
    use OptimizesUploadedImages;

    protected $signature = 'images:optimize-backfill
        {--dry-run : List what would change without touching S3 or the database}
        {--limit=0 : Stop after N images per model (0 = no limit)}';

    protected $description = 'Resize + convert to WebP the images already stored in S3/R2 for devocionales, ensenanzas and post_images, and update their URLs.';

    private int $processed = 0;
    private int $failed = 0;
    private int $skipped = 0;
    private int $thumbsGenerated = 0;
    private int $bytesBefore = 0;
    private int $bytesAfter = 0;

    public function handle(): int
    {
        $baseUrl = rtrim((string) config('filesystems.disks.s3.url', ''), '/');

        if ($baseUrl === '') {
            $this->error('filesystems.disks.s3.url is not configured.');

            return self::FAILURE;
        }

        $dryRun = (bool) $this->option('dry-run');
        $limit = (int) $this->option('limit');

        $this->components->info($dryRun ? 'Dry run — no changes will be made.' : 'Live run — S3 objects and DB rows will be modified.');

        $this->backfillColumn(Devocional::class, 'imagen', $baseUrl, $dryRun, $limit, maxWidth: 1600, quality: 80);
        $this->backfillColumn(Ensenanza::class, 'imagen', $baseUrl, $dryRun, $limit, maxWidth: 1600, quality: 80);
        $this->backfillColumn(PostImage::class, 'url', $baseUrl, $dryRun, $limit, maxWidth: 1080, quality: 82);

        $savedKb = round(($this->bytesBefore - $this->bytesAfter) / 1024, 1);
        $this->components->info("Done. Processed {$this->processed}, skipped {$this->skipped}, thumbs generated {$this->thumbsGenerated}, failed {$this->failed}. Saved {$savedKb} KiB.");

        return $this->failed === 0 ? self::SUCCESS : self::FAILURE;
    }

    /**
     * @param class-string<Model> $modelClass
     */
    private function backfillColumn(string $modelClass, string $column, string $baseUrl, bool $dryRun, int $limit, int $maxWidth, int $quality): void
    {
        $disk = Storage::disk('s3');
        $prefix = $baseUrl.'/';
        $table = (new $modelClass)->getTable();
        $this->components->info("Scanning {$table}.{$column}");

        $count = 0;

        $modelClass::query()
            ->whereNotNull($column)
            ->where($column, 'like', $prefix.'%')
            ->chunkById(25, function ($rows) use ($column, $prefix, $disk, $dryRun, $limit, $maxWidth, $quality, &$count) {
                foreach ($rows as $row) {
                    if ($limit > 0 && $count >= $limit) {
                        return false;
                    }

                    $url = $row->{$column};
                    $key = substr($url, strlen($prefix));

                    if (str_ends_with(strtolower($key), '.webp')) {
                        try {
                            $this->ensureThumb($key, $disk, $dryRun);
                        } catch (\Throwable $exception) {
                            $this->warn("Failed to generate thumb for {$key}: {$exception->getMessage()}");
                        }

                        $this->skipped++;

                        continue;
                    }

                    $count++;

                    try {
                        $this->backfillOne($row, $column, $key, $disk, $prefix, $dryRun, $maxWidth, $quality);
                    } catch (\Throwable $exception) {
                        $this->failed++;
                        $this->warn("Failed {$key}: {$exception->getMessage()}");
                    }
                }

                return true;
            });
    }

    private function backfillOne(Model $row, string $column, string $key, $disk, string $prefix, bool $dryRun, int $maxWidth, int $quality): void
    {
        if (! $disk->exists($key)) {
            $this->skipped++;
            $this->warn("Missing in S3, skipping: {$key}");

            return;
        }

        $contents = $disk->get($key);
        $mime = (new \finfo(FILEINFO_MIME_TYPE))->buffer($contents);

        $optimized = $this->optimizeImageBytes($contents, $mime, $maxWidth, $quality);

        if ($optimized['extension'] !== 'webp') {
            // GIF or unsupported format — nothing to optimize.
            $this->skipped++;

            return;
        }

        $originalBytes = strlen($contents);
        $newBytes = strlen($optimized['contents']);

        if ($dryRun) {
            $this->line(sprintf('Would optimize %s (%s KiB -> %s KiB)', $key, round($originalBytes / 1024, 1), round($newBytes / 1024, 1)));
            $this->bytesBefore += $originalBytes;
            $this->bytesAfter += $newBytes;
            $this->processed++;

            return;
        }

        $newKey = dirname($key).'/'.Str::random(40).'.webp';

        $disk->put($newKey, $optimized['contents'], [
            'visibility' => 'public',
            'CacheControl' => 'public, max-age=31536000, immutable',
            'ContentType' => 'image/webp',
        ]);

        $disk->put($this->thumbKeyFor($newKey), $this->makeThumbnail($optimized['contents'], 640), [
            'visibility' => 'public',
            'CacheControl' => 'public, max-age=31536000, immutable',
            'ContentType' => 'image/webp',
        ]);
        $this->thumbsGenerated++;

        $row->forceFill([$column => $prefix.$newKey])->save();

        $disk->delete($key);

        $this->bytesBefore += $originalBytes;
        $this->bytesAfter += $newBytes;
        $this->processed++;

        $this->line(sprintf('Optimized %s -> %s (%s KiB -> %s KiB)', $key, $newKey, round($originalBytes / 1024, 1), round($newBytes / 1024, 1)));
    }

    private function ensureThumb(string $key, $disk, bool $dryRun): void
    {
        $thumbKey = $this->thumbKeyFor($key);

        if ($disk->exists($thumbKey)) {
            return;
        }

        if ($dryRun) {
            $this->line("Would generate thumb: {$thumbKey}");
            $this->thumbsGenerated++;

            return;
        }

        if (! $disk->exists($key)) {
            return;
        }

        $disk->put($thumbKey, $this->makeThumbnail($disk->get($key), 640), [
            'visibility' => 'public',
            'CacheControl' => 'public, max-age=31536000, immutable',
            'ContentType' => 'image/webp',
        ]);

        $this->thumbsGenerated++;
        $this->line("Generated thumb: {$thumbKey}");
    }
}
