<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContentLike extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'content_id',
        'content_type',
        'visitor_hash',
        'ip_segment',
        'created_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    const TYPE_DEVOCIONAL = 'devocional';
    const TYPE_ESTUDIO    = 'estudio';
    const TYPE_ENSENANZA  = 'ensenanza';

    public function scopeForContent($query, string $type, string $id)
    {
        return $query->where('content_type', $type)->where('content_id', $id);
    }
}