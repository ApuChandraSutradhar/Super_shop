<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $primaryKey = 'order_id';

    protected $fillable = [
        'order_number',
        'customer_id',
        'total_amount',
        'discount_amount',
        'payable_amount',
        'order_status',
        'coupon_id',
        'delivery_person_id'
    ];

    // Customer Relationship
    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id', 'id');
    }

    // Order Items Relationship
    public function orderItems()
    {
        return $this->hasMany(OrderItem::class, 'order_id', 'order_id');
    }

    // Payment Relationship
    public function payment()
    {
        return $this->hasOne(Payment::class, 'order_id', 'order_id');
    }
}