<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DevocionalView extends Model
{
    protected
        $fillable = ['devocional_id', 'ip_address', 'country', 'platform'];
}