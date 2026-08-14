<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    // 🛍️ ১. ফ্রন্টএন্ড থেকে অর্ডার সেভ করার API (Cart Auto-Clear সহ)
    public function placeOrder(Request $request)
    {
        $request->validate([
            'customer_id'    => 'required',
            'total_amount'   => 'required|numeric',
            'payable_amount' => 'required|numeric',
            'payment_method' => 'required|string',
            'items'          => 'required|array'
        ]);

        DB::beginTransaction();
        try {
            // A. orders টেবিলে এনট্রি
            $order = Order::create([
                'order_number'    => 'FM-' . rand(100000, 999999),
                'customer_id'     => $request->customer_id,
                'total_amount'    => $request->total_amount,
                'discount_amount' => $request->discount_amount ?? 0.00,
                'payable_amount'  => $request->payable_amount,
                'order_status'    => 'pending',
            ]);

            // B. order_items টেবিলে একাধিক প্রোডাক্ট সেভ
            foreach ($request->items as $item) {
                OrderItem::create([
                    'order_id'   => $order->order_id,
                    'product_id' => $item['product_id'],
                    'quantity'   => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'subtotal'   => $item['unit_price'] * $item['quantity'],
                ]);
            }

            // C. payments টেবিলে পেমেন্ট ডাটা সেভ
            Payment::create([
                'order_id'       => $order->order_id,
                'payment_method' => $request->payment_method,
                'payment_status' => $request->payment_method === 'COD' ? 'pending' : 'paid',
                'transaction_id' => $request->transaction_id ?? null,
                'amount'         => $request->payable_amount,
            ]);

            // 🛒 D. ডাটাবেজ থেকে কাস্টমারের Cart এবং Cart Items ডিলিট করা
            // ১. customer_id (users.id) দিয়ে carts টেবিল থেকে cart রেকর্ড খুঁজে বের করা
            $cart = DB::table('carts')->where('user_id', $request->customer_id)->first();

            if ($cart) {
                // ২. cart_items টেবিল থেকে উক্ত cart_id-এর সব আইটেম ডিলিট করা
                DB::table('cart_items')->where('cart_id', $cart->cart_id)->delete();

                // ৩. মূল carts টেবিল থেকেও সেই কার্টটি রিমুভ করা (যাতে কার্ট সম্পূর্ণ ফ্রেশ হয়ে যায়)
                DB::table('carts')->where('cart_id', $cart->cart_id)->delete();
            }

            DB::commit();

            return response()->json([
                'success'      => true,
                'message'      => 'Order placed & cart cleared successfully!',
                'order_number' => $order->order_number,
                'order_id'     => $order->order_id
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    // 👨‍💼 ২. এডমিন প্যানেলে সব অর্ডার লিস্ট দেখানোর API
    public function getAllOrdersForAdmin()
    {
        $orders = Order::with(['customer', 'orderItems.product', 'payment'])
            ->orderBy('order_id', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'orders'  => $orders
        ]);
    }

    // 👨‍💼 ৩. এডমিন পেমেন্ট চেক করে Order Status ও Payment Status আপডেট করার API
    public function updateOrderStatus(Request $request, $orderId)
    {
        $order = Order::findOrFail($orderId);

        if ($request->has('order_status')) {
            $order->order_status = $request->order_status;
            $order->save();
        }

        if ($request->has('payment_status')) {
            Payment::where('order_id', $orderId)->update([
                'payment_status' => $request->payment_status
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Order status updated successfully!'
        ]);
    }
}