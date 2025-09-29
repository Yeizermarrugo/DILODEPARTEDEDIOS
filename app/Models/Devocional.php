<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Devocional extends Model
{
    use HasFactory;

    protected $fillable = ['contenido', 'imagen', 'categoria', 'autor'];

    // Indica que la clave primaria no es autoincrementable y es string
    public $incrementing = false;
    protected $keyType = 'string';

    // Asigna UUID automáticamente al crear un nuevo registro
    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (!$model->id) {
                $model->id = (string) Str::uuid();
            }
        });
    }
}
