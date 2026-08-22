<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    use HasFactory;

    protected $table = 'coupons';

    protected $primaryKey = 'coupon_id';

    protected $fillable = [
        'user_id',
        'coupon_code',
        'discount_amount',
        'min_purchase_amount',
        'valid_until',
        'is_used',
    ];

    public $timestamps = true;
}