<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use NotificationChannels\WebPush\HasPushSubscriptions;

class Visitor extends Model
{
    use Notifiable, HasPushSubscriptions;

    protected $fillable = ['visitor_id'];

    // No necesita timestamps obligatorios
    public $timestamps = true;
}