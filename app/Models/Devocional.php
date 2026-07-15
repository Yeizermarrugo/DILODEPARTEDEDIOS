<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Devocional extends Model
{
    use HasFactory;

    protected $table = 'devocionals';

    protected $fillable = [
        'contenido',
        'imagen',
        'categoria',
        'autor',
        'is_devocional',
        'hidden',
        'serie',
        'created_at',
        'ensenanza_id',
        'pdf',
        'instagram',
        'tiktok',
        'notificado_at',
        'short_code',
        'shares_count',
        'audio_folder_month',
        'audio_folder_position',
    ];

    // PK UUID string
    public $incrementing = false;
    protected $keyType = 'string';

    protected $casts = [
        'is_devocional'          => 'integer',
        'hidden'                 => 'boolean',
        'created_at'             => 'datetime',
        'audio_folder_month'     => 'integer',
        'audio_folder_position'  => 'integer',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (! $model->id) {
                $model->id = (string) Str::uuid();
            }
        });

        // Auto-incorporates new devocionales into the audio-folder calendar
        // (next open slot, January first) so the admin only needs to run the
        // "fill gaps" backfill once for pre-existing content.
        static::created(function (Devocional $model) {
            if ($model->is_devocional === self::TYPE_DEVOCIONAL && $model->audio_folder_month === null) {
                app(\App\Services\DevocionalAudioFolderService::class)->assignNext($model);
            }
        });
    }

    // is_devocional values
    const TYPE_OCULTO    = 0;
    const TYPE_DEVOCIONAL = 1;
    const TYPE_SERIE     = 2;
    const TYPE_ESTUDIO   = 3;

    /**
     * Scope: solo episodios de series (is_devocional = 2, tienen ensenanza_id)
     */
    public function scopeSoloEnsenanzas($query)
    {
        return $query->where('is_devocional', self::TYPE_SERIE);
    }

    public function scopeSoloDevocionales($query)
    {
        return $query->where('is_devocional', self::TYPE_DEVOCIONAL);
    }

    /**
     * Scope: devocionales asignados a una carpeta de audio mensual, en orden de posición.
     */
    public function scopeInAudioFolder($query, int $month)
    {
        return $query->where('is_devocional', self::TYPE_DEVOCIONAL)
            ->where('audio_folder_month', $month)
            ->orderBy('audio_folder_position');
    }

    /**
     * Enseñanza/serie a la que pertenece este devocional.
     */
    public function ensenanza()
    {
        return $this->belongsTo(Ensenanza::class);
    }

    public function category()
    {
        return $this->belongsTo(DevocionalCategory::class, 'categoria', 'name');
    }
}
