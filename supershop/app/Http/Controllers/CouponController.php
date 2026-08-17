<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Coupon;

class CouponController extends Controller
{
    public function getUserCoupons(Request $request)
    {
        $userId = $request->query('user_id');

        $query = Coupon::query();

        // user_id থাকলে ফিল্টার করবে, না থাকলে সব কুপন দেখাবে
        if ($userId) {
            $query->where('user_id', $userId);
        }

        $coupons = $query->orderBy('created_at', 'desc')->get();

        return response()->json($coupons);
    }
}