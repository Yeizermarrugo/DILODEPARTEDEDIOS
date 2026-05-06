<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class ContactMessage extends Model
{
    protected $fillable = ['name', 'email', 'whatsapp', 'subject', 'body', 'read_at', 'archived_at'];

    protected $casts = ['read_at' => 'datetime', 'archived_at' => 'datetime'];

    public function scopeUnread(Builder $query): Builder
    {
        return $query->whereNull('read_at');
    }
}
