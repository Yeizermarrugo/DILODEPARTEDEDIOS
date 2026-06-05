<?php

namespace App\Console\Commands;

use App\Jobs\GenerateDevocionalAudio;
use App\Models\Devocional;
use App\Services\TextToSpeechService;
use Carbon\Carbon;
use Illuminate\Console\Command;

class GeneratePublishedDevocionalAudio extends Command
{
    protected $signature = 'tts:pregenerate-devocionales
        {--id= : Generate audio for a single devocional id}
        {--days=15 : Generate audio for visible content published from this many days ago through today}
        {--all : Include all visible content instead of only the recent window}
        {--limit= : Maximum number of visible records to enqueue}
        {--sync : Generate immediately in this process instead of dispatching jobs}';

    protected $description = 'Pregenerate TTS audio for visible devocionales, estudios, and series';

    public function handle(TextToSpeechService $tts): int
    {
        $query = Devocional::query()
            ->where('hidden', false)
            ->whereNotNull('contenido')
            ->orderBy('created_at', 'desc');

        if ($this->option('id')) {
            $query->where('id', (string) $this->option('id'));
        } elseif (! $this->option('all')) {
            $days = max(0, (int) $this->option('days'));
            $from = Carbon::today('America/Bogota')->subDays($days)->startOfDay();
            $to = Carbon::today('America/Bogota')->endOfDay();

            $query->whereBetween('created_at', [$from, $to]);
        }

        if ($this->option('limit')) {
            $query->limit((int) $this->option('limit'));
        }

        $count = 0;

        foreach ($query->cursor() as $devocional) {
            if ($this->option('sync')) {
                (new GenerateDevocionalAudio($devocional->id))->handle($tts);
            } else {
                GenerateDevocionalAudio::dispatch($devocional->id);
            }

            $count++;
            $this->line(($this->option('sync') ? 'Generated' : 'Queued')." TTS for {$devocional->id}");
        }

        $this->info("TTS pregeneration processed {$count} content item(s).");

        return Command::SUCCESS;
    }
}
