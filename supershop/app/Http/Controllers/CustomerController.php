<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class CustomerController extends Controller
{
    public function index()
    {
        try {
            // 'users' টেবিল থেকে কাস্টমার লিস্ট, টোটাল অর্ডার এবং মোট খরচ রিটার্ন করা হচ্ছে
            $customers = User::select('id', 'name', 'email', 'phone', 'created_at')
                ->get()
                ->map(function ($user) {
                    $ordersCount = DB::table('orders')->where('customer_id', $user->id)->count();
                    $totalSpent = DB::table('orders')->where('customer_id', $user->id)->sum('payable_amount');

                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'phone' => $user->phone ?? 'N/A',
                        'orders_count' => $ordersCount,
                        'total_spent' => $totalSpent,
                        'status' => 'Active',
                        'created_at' => $user->created_at,
                    ];
                });

            return response()->json([
                'success' => true,
                'customers' => $customers
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function updateStatus(Request $request, $id)
    {
        try {
            // প্রয়োজন হলে স্ট্যাটাস আপডেট লজিক
            return response()->json([
                'success' => true,
                'message' => 'Status updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }
}