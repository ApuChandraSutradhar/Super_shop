<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    use HasFactory;

    // ডাটাবেজের টেবিল নাম
    protected $table = 'coupons';

    // ডাটাবেজের Primary Key নির্দিষ্ট করে দেয়া
    protected $primaryKey = 'coupon_id';

    // Mass Assignment-এর জন্য ফিল্ডসমূহ
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