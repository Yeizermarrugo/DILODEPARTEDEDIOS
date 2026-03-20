<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DevocionalView extends Model
{
    protected $fillable = [
        'devocional_id',
        'ip_address',
        'country',
        'browser',
        'platform',
        'accepted_terms',
        'local_time',
        'created_at', // Agrégalo aquí también
        'updated_at'  // Agrégalo aquí también
    ];

    // Esto asegura que Laravel trate a created_at como fecha aunque lo mandemos manual
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
}