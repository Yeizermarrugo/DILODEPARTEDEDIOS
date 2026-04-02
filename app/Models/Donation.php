<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Donation extends Model
{
    /**
     * Los atributos que se pueden asignar de manera masiva.
     *
     * @var array
     */
    protected $fillable = [
        'ref_payco',
        'transaction_id',
        'amount',
        'currency',
        'status',
        'description',
        'bank_name',      // Nuevo
        'receipt_number', // Nuevo
        'ip_address',     // Nuevo
        'customer_name',
        'customer_email',
        'customer_phone', // Nuevo
        'raw_response',
        'ref_payco_hash',
    ];

    /**
     * Si quieres que Laravel maneje los tipos de datos automáticamente
     */
    protected $casts = [
        'amount' => 'decimal:2',
        'raw_response' => 'array', // Si lo guardas como JSON en PostgreSQL
    ];
}