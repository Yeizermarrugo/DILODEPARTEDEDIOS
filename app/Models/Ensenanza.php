<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Ensenanza extends Model
{
    use HasFactory;

    protected $table = 'ensenanzas';

    protected $fillable = [
        'slug',
        'titulo',
        'descripcion',
        'imagen',
    ];

    // PK UUID string
    public $incrementing = false;
    protected $keyType = 'string';

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
     * Devocionales que forman parte de esta enseñanza/serie.
     * Solo devuelve los que son realmente enseñanzas.
     */
    public function devocionales()
    {
        return $this->hasMany(Devocional::class)
                    ->soloEnsenanzas();
    }
}