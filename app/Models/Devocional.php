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
        'serie',
        'created_at',
        'ensenanza_id',
        'pdf',
        'instagram',
        'tiktok',
        'notificado_at',
        'short_code',
        'shares_count',
    ];

    // PK UUID string
    public $incrementing = false;
    protected $keyType = 'string';

    protected $casts = [
        'is_devocional' => 'integer',
        'created_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (! $model->id) {
                $model->id = (string) Str::uuid();
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

    /**
     * Enseñanza/serie a la que pertenece este devocional.
     */
    public function ensenanza()
    {
        return $this->belongsTo(Ensenanza::class);
    }
}