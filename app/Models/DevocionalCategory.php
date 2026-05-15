<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DevocionalCategory extends Model
{
    protected $fillable = [
        'name',
        'description',
    ];

    public function devocionales()
    {
        return $this->hasMany(Devocional::class, 'categoria', 'name');
    }
}
