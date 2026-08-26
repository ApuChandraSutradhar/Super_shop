<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Delivery extends Model
{
    use HasFactory;

    protected $primaryKey = 'delivery_id';

    protected $fillable = [
        'order_id', 'delivery_person_id', 'otp_code', 'cash_collected', 'delivery_status',
        'settlement_status', 'collected_at', 'settled_at', 'assigned_at',
    ];

    protected function casts(): array
    {
        return ['cash_collected' => 'decimal:2', 'assigned_at' => 'datetime', 'collected_at' => 'datetime', 'settled_at' => 'datetime'];
    }

    public function order()
    {
        return $this->belongsTo(Order::class, 'order_id', 'order_id');
    }

    public function deliveryPerson()
    {
        return $this->belongsTo(User::class, 'delivery_person_id', 'id');
    }
}
