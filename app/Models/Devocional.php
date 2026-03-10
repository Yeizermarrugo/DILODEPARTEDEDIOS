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

    /**
     * Scope: solo registros que son enseñanzas (Series + is_devocional = 1)
     */
    public function scopeSoloEnsenanzas($query)
    {
        return $query->where('serie', 'Series')
                     ->where('is_devocional', 1);
    }

    /**
     * Enseñanza/serie a la que pertenece este devocional.
     */
    public function ensenanza()
    {
        return $this->belongsTo(Ensenanza::class);
    }
}