<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    private function normalizePaymentMethod(?string $paymentMethod): string
    {
        $normalized = strtolower(trim((string) $paymentMethod));

        return match ($normalized) {
            'cod' => 'COD',
            'bkash' => 'bKash',
            'nagad' => 'Nagad',
            'card', 'visa', 'mastercard', 'amex' => 'Card',
            default => 'COD',
        };
    }

    // 🛍️ ১. অর্ডার সেভ করার API (Payment & Coupon ডাটা সহ)
    public function placeOrder(Request $request)
    {
        $request->validate([
            'customer_id'    => ['required', 'exists:users,id'],
            'total_amount'   => 'required|numeric',
            'payable_amount' => 'required|numeric',
            'payment_method' => 'required|string',
            'items'          => 'required|array',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric',
        ]);

        $paymentMethod = $this->normalizePaymentMethod($request->payment_method);

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
                'payment_method' => $paymentMethod,
                'payment_status' => in_array($paymentMethod, ['COD'], true) ? 'pending' : 'paid',
                'transaction_id' => $request->transaction_id ?? null,
                'amount'         => (float) $request->payable_amount,
            ]);

            // 🎟️ D. coupons টেবিলে কুপন ডাটা সেভ করা (কুপন কোড থাকলে)
            $discountAmount = (float) ($request->discount_amount ?? 0);
            $couponCode = trim((string) ($request->coupon_code ?? $request->coupon ?? ''));
            $minPurchaseAmount = (float) ($request->min_purchase_amount ?? $request->total_amount ?? $request->payable_amount ?? 0);
            $hasCouponCode = $couponCode !== '' || $discountAmount > 0;

            if ($hasCouponCode) {
                $couponCode = $couponCode !== '' ? $couponCode : 'AUTO2000_OFFER';

                DB::table('coupons')->updateOrInsert(
                    ['coupon_code' => (string) $couponCode],
                    [
                        'user_id'             => $request->customer_id,
                        'discount_amount'     => $discountAmount,
                        'min_purchase_amount' => $minPurchaseAmount,
                        'valid_until'         => now()->addDays(30)->toDateString(),
                        'is_used'             => (bool) ($request->is_used ?? 1),
                        'created_at'          => now(),
                        'updated_at'          => now(),
                    ]
                );
            }

            // 🛒 E. ডাটাবেজ থেকে কাস্টমারের Cart ডিলিট করা
            $cart = DB::table('carts')->where('user_id', $request->customer_id)->first();
            if ($cart) {
                DB::table('cart_items')->where('cart_id', $cart->cart_id)->delete();
                DB::table('carts')->where('cart_id', $cart->cart_id)->delete();
            }

            DB::commit();

            return response()->json([
                'success'      => true,
                'message'      => 'Order, Payment & Coupon processed successfully!',
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

    // 🎟️ ২. কাস্টমারের কুপন লিস্ট দেখার API
    public function getUserCoupons($userId)
    {
        try {
            $coupons = DB::table('coupons')
                ->where('user_id', $userId)
                ->orderBy('coupon_id', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'coupons' => $coupons
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    // 👨‍💼 ৩. এডমিন প্যানেলে সব অর্ডার লিস্ট দেখানোর API
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

    // 👨‍💼 ৪. অর্ডার স্ট্যাটাস ও পেমেন্ট আপডেট করার API
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