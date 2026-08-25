<?php

namespace App\Models;

use Database\Factories\RefundFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Refund extends Model
{
    /** @use HasFactory<RefundFactory> */
    use HasFactory;

    protected $primaryKey = 'refund_id';

    protected $fillable = [
        'order_id',
        'customer_id',
        'reason',
        'cancellation_status',
        'order_status_at_request',
        'admin_remarks',
        'calculated_refund_amount',
        'deduction_amount',
        'requested_at',
    ];

    protected function casts(): array
    {
        return [
            'calculated_refund_amount' => 'decimal:2',
            'deduction_amount' => 'decimal:2',
            'requested_at' => 'datetime',
        ];
    }

    public function order()
    {
        return $this->belongsTo(Order::class, 'order_id', 'order_id');
    }

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id', 'id');
    }
}
