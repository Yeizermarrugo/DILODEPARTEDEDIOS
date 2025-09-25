<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Devocional extends Model
{
    use HasFactory;

    protected $fillable = ['contenido', 'imagen', 'categoria', 'autor'];
}
