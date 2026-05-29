<?php

namespace App\Console\Commands;

use App\Traits\UsesStoragePrefix;
use Illuminate\Console\Command;
use Illuminate\Filesystem\AwsS3V3Adapter;
use Illuminate\Support\Facades\Storage;

class RefreshStorageCacheControl extends Command
{
    use UsesStoragePrefix;

    protected $signature = 'storage:cache-control
        {--folders=imagenes,postCard,videos,tts,pdf : Comma-separated storage folders to update}
        {--max-age=31536000 : Browser cache lifetime in seconds}
        {--dry-run : List files without updating metadata}';

    protected $description = 'Update Cache-Control metadata for public S3/Laravel Cloud Files assets.';

    public function handle(): int
    {
        $disk = Storage::disk('s3');

        if (! $disk instanceof AwsS3V3Adapter) {
            $this->error('The s3 disk must use the AWS S3 adapter.');

            return self::FAILURE;
        }

        $bucket = (string) config('filesystems.disks.s3.bucket');
        if ($bucket === '') {
            $this->error('S3 bucket is not configured.');

            return self::FAILURE;
        }

        $client = $disk->getClient();
        $cacheControl = sprintf('public, max-age=%d, immutable', max(0, (int) $this->option('max-age')));
        $folders = collect(explode(',', (string) $this->option('folders')))
            ->map(fn (string $folder) => trim($folder, " \t\n\r\0\x0B/"))
            ->filter()
            ->map(fn (string $folder) => $this->storageFolder($folder))
            ->unique()
            ->values();

        $dryRun = (bool) $this->option('dry-run');
        $updated = 0;
        $failed = 0;

        foreach ($folders as $folder) {
            $this->components->info("Scanning {$folder}");

            foreach ($disk->allFiles($folder) as $path) {
                if ($dryRun) {
                    $this->line("Would update {$path}");
                    $updated++;

                    continue;
                }

                try {
                    $head = $client->headObject([
                        'Bucket' => $bucket,
                        'Key' => $path,
                    ]);

                    $options = [
                        'Bucket' => $bucket,
                        'Key' => $path,
                        'CopySource' => rawurlencode($bucket).'/'.str_replace('%2F', '/', rawurlencode($path)),
                        'MetadataDirective' => 'REPLACE',
                        'CacheControl' => $cacheControl,
                        'ContentType' => $head['ContentType'] ?? 'application/octet-stream',
                        'Metadata' => $head['Metadata'] ?? [],
                    ];

                    foreach (['ContentDisposition', 'ContentEncoding', 'ContentLanguage'] as $header) {
                        if (isset($head[$header])) {
                            $options[$header] = $head[$header];
                        }
                    }

                    $client->copyObject($options);
                    $updated++;
                } catch (\Throwable $exception) {
                    $failed++;
                    $this->warn("Failed {$path}: {$exception->getMessage()}");
                }
            }
        }

        $this->components->info("Updated {$updated} object(s) with Cache-Control: {$cacheControl}");

        return $failed === 0 ? self::SUCCESS : self::FAILURE;
    }
}
