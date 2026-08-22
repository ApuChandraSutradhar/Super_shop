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
            $discountAmount = (float) ($request->discount_amount ?? 0);
            $couponCode = trim((string) ($request->coupon_code ?? $request->coupon ?? ''));
            $minPurchaseAmount = (float) ($request->min_purchase_amount ?? $request->total_amount ?? $request->payable_amount ?? 0);
            $hasCouponCode = $couponCode !== '' || $discountAmount > 0;
            $couponId = null;

            if ($hasCouponCode) {
                $couponCode = $couponCode !== '' ? $couponCode : 'AUTO2000_OFFER';

                $couponId = DB::table('coupons')->where('coupon_code', (string) $couponCode)->value('coupon_id');

                if ($couponId === null) {
                    $couponId = DB::table('coupons')->insertGetId([
                        'user_id'             => $request->customer_id,
                        'coupon_code'         => (string) $couponCode,
                        'discount_amount'     => $discountAmount,
                        'min_purchase_amount' => $minPurchaseAmount,
                        'valid_until'         => now()->addDays(30)->toDateString(),
                        'is_used'             => (bool) ($request->is_used ?? 1),
                        'created_at'          => now(),
                        'updated_at'          => now(),
                    ]);
                } else {
                    DB::table('coupons')->where('coupon_id', $couponId)->update([
                        'user_id'             => $request->customer_id,
                        'discount_amount'     => $discountAmount,
                        'min_purchase_amount' => $minPurchaseAmount,
                        'valid_until'         => now()->addDays(30)->toDateString(),
                        'is_used'             => (bool) ($request->is_used ?? 1),
                        'updated_at'          => now(),
                    ]);
                }
            }

            $order = Order::create([
                'order_number'    => 'FM-' . rand(100000, 999999),
                'customer_id'     => $request->customer_id,
                'total_amount'    => $request->total_amount,
                'discount_amount' => $discountAmount,
                'payable_amount'  => $request->payable_amount,
                'coupon_id'       => $couponId,
                'order_status'    => 'pending',
            ]);

            foreach ($request->items as $item) {
                OrderItem::create([
                    'order_id'   => $order->order_id,
                    'product_id' => $item['product_id'],
                    'quantity'   => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'subtotal'   => $item['unit_price'] * $item['quantity'],
                ]);
            }

            Payment::create([
                'order_id'       => $order->order_id,
                'payment_method' => $paymentMethod,
                'payment_status' => in_array($paymentMethod, ['COD'], true) ? 'pending' : 'paid',
                'transaction_id' => $request->transaction_id ?? null,
                'amount'         => (float) $request->payable_amount,
            ]);

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