<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $casts = [
        'order_items_summary' => 'array',
    ];

    protected $primaryKey = 'order_id';

    protected $fillable = [
        'order_number',
        'customer_id',
        'total_amount',
        'discount_amount',
        'payable_amount',
        'order_status',
        'coupon_id',
        'delivery_person_id',
        'shipping_address',
        'delivery_name',
        'delivery_phone',
        'delivery_city',
        'order_notes',
        'order_items_summary',
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

    public function deliveryPerson()
    {
        return $this->belongsTo(User::class, 'delivery_person_id', 'id');
    }

    public function delivery()
    {
        return $this->hasOne(Delivery::class, 'order_id', 'order_id');
    }

    public function feedback()
    {
        return $this->hasMany(Feedback::class, 'order_id', 'order_id');
    }
}
