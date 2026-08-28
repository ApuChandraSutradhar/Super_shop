<?php

namespace App\Http\Controllers;

use App\Models\AdminNotification;
use App\Models\Delivery;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;
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
        $validated = $request->validate([
            'customer_id' => ['required', 'exists:users,id'],
            'total_amount' => 'required|numeric',
            'payable_amount' => 'required|numeric',
            'discount_amount' => 'nullable|numeric|min:0',
            'min_purchase_amount' => 'nullable|numeric|min:0',
            'coupon_code' => 'nullable|string|max:255',
            'is_used' => 'nullable|boolean',
            'payment_method' => 'required|string',
            'sender_number' => 'nullable|string|max:50',
            'transaction_id' => 'nullable|string|max:100',
            'delivery_name' => 'nullable|string|max:255',
            'delivery_phone' => 'nullable|string|max:30',
            'delivery_city' => 'nullable|string|max:255',
            'shipping_address' => 'nullable|string',
            'order_notes' => 'nullable|string',
            'items' => 'required|array',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric',
        ]);

        $paymentMethod = $this->normalizePaymentMethod($validated['payment_method']);

        try {
            $order = DB::transaction(function () use ($request, $validated, $paymentMethod): Order {
                $discountAmount = (float) ($validated['discount_amount'] ?? 0);
                $couponCode = trim((string) ($validated['coupon_code'] ?? $request->coupon ?? ''));
                $minPurchaseAmount = (float) ($validated['min_purchase_amount'] ?? $validated['total_amount'] ?? $validated['payable_amount']);
                $hasCouponCode = $couponCode !== '' || $discountAmount > 0;
                $couponId = null;

                if ($hasCouponCode) {
                    $couponCode = $couponCode !== '' ? $couponCode : 'AUTO2000_OFFER';

                    $couponId = DB::table('coupons')->where('coupon_code', (string) $couponCode)->value('coupon_id');

                    if ($couponId === null) {
                        $couponId = DB::table('coupons')->insertGetId([
                            'user_id' => $request->customer_id,
                            'coupon_code' => (string) $couponCode,
                            'discount_amount' => $discountAmount,
                            'min_purchase_amount' => $minPurchaseAmount,
                            'valid_until' => now()->addDays(30)->toDateString(),
                            'is_used' => (bool) ($request->is_used ?? 1),
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                    } else {
                        DB::table('coupons')->where('coupon_id', $couponId)->update([
                            'user_id' => $request->customer_id,
                            'discount_amount' => $discountAmount,
                            'min_purchase_amount' => $minPurchaseAmount,
                            'valid_until' => now()->addDays(30)->toDateString(),
                            'is_used' => (bool) ($request->is_used ?? 1),
                            'updated_at' => now(),
                        ]);
                    }
                }

                $order = Order::create([
                    'order_number' => 'FM-'.rand(100000, 999999),
                    'customer_id' => $validated['customer_id'],
                    'total_amount' => $validated['total_amount'],
                    'discount_amount' => $discountAmount,
                    'payable_amount' => $validated['payable_amount'],
                    'coupon_id' => $couponId,
                    'order_status' => 'pending',
                    'delivery_name' => $validated['delivery_name'] ?? null,
                    'delivery_phone' => $validated['delivery_phone'] ?? null,
                    'delivery_city' => $validated['delivery_city'] ?? null,
                    'shipping_address' => $validated['shipping_address'] ?? null,
                    'order_notes' => $validated['order_notes'] ?? null,
                    'order_items_summary' => collect($validated['items'])->map(fn ($item) => [
                        'product_id' => $item['product_id'],
                        'name' => $item['product_name'] ?? null,
                        'quantity' => $item['quantity'],
                        'unit_price' => $item['unit_price'],
                    ])->values()->all(),
                ]);

                foreach ($validated['items'] as $item) {
                    // Lock the product row so concurrent checkouts cannot oversell it.
                    $product = Product::query()
                        ->lockForUpdate()
                        ->find($item['product_id']);

                    if (! $product || $product->stock < $item['quantity']) {
                        $productName = $product?->name ?? 'the selected product';

                        throw new \DomainException("Stock not available for {$productName}");
                    }

                    $product->decrement('stock', $item['quantity']);

                    OrderItem::create([
                        'order_id' => $order->order_id,
                        'product_id' => $item['product_id'],
                        'quantity' => $item['quantity'],
                        'unit_price' => $item['unit_price'],
                        'subtotal' => $item['unit_price'] * $item['quantity'],
                    ]);
                }

                Payment::create([
                    'order_id' => $order->order_id,
                    'payment_method' => $paymentMethod,
                    'payment_status' => in_array($paymentMethod, ['COD'], true) ? 'pending' : 'paid',
                    'transaction_id' => $validated['transaction_id'] ?? null,
                    'sender_number' => $validated['sender_number'] ?? null,
                    'amount' => (float) $validated['payable_amount'],
                ]);

                AdminNotification::record(
                    'new_order',
                    'New order placed',
                    "Order {$order->order_number} was placed by {$order->delivery_name}.",
                    '/admin/orders',
                    ['order_id' => $order->order_id]
                );

                $cart = DB::table('carts')->where('user_id', $validated['customer_id'])->first();
                if ($cart) {
                    DB::table('cart_items')->where('cart_id', $cart->cart_id)->delete();
                    DB::table('carts')->where('cart_id', $cart->cart_id)->delete();
                }

                return $order;
            });

            return response()->json([
                'success' => true,
                'message' => 'Order, Payment & Coupon processed successfully!',
                'order_number' => $order->order_number,
                'order_id' => $order->order_id,
            ], 201);

        } catch (\DomainException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        } catch (\Throwable $e) {

            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
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
                'coupons' => $coupons,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function getCustomerOrders(Request $request)
    {
        $request->validate([
            'customer_id' => ['required', 'exists:users,id'],
        ]);

        $orders = Order::with(['orderItems.product', 'payment', 'refund'])
            ->where('customer_id', $request->customer_id)
            ->orderByDesc('order_id')
            ->get();

        return response()->json([
            'success' => true,
            'orders' => $orders,
        ]);
    }

    public function getAllOrdersForAdmin()
    {
        $orders = Order::with(['customer', 'orderItems.product:id,name,image', 'payment', 'deliveryPerson'])
            ->orderBy('order_id', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'orders' => $orders,
        ]);
    }

    public function updateOrderStatus(Request $request, $orderId)
    {
        $order = Order::findOrFail($orderId);
        $statusChanged = false;

        if ($request->has('order_status')) {
            $request->validate([
                'order_status' => ['in:pending,confirmed,processing,packing,shipping,shipped,delivered,cancelled'],
            ]);
            $statusChanged = $order->order_status !== $request->order_status;
            $order->order_status = $request->order_status;
            $order->save();
        }

        if ($statusChanged && $order->delivery_person_id) {
            AdminNotification::record(
                'order_status_update',
                'Order status updated',
                "Admin changed order {$order->order_number} to ".str_replace('_', ' ', $order->order_status).'.',
                '/delivery/assigned-orders',
                ['order_id' => $order->order_id, 'status' => $order->order_status],
                $order->delivery_person_id
            );
        }

        if ($request->has('payment_status')) {
            Payment::where('order_id', $orderId)->update([
                'payment_status' => $request->payment_status,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Order status updated successfully!',
        ]);
    }

    public function assignDeliveryRider(Request $request, $orderId)
    {
        $request->validate(['delivery_person_id' => ['nullable', 'integer']]);

        $order = Order::findOrFail($orderId);
        if ($request->filled('delivery_person_id')) {
            User::where('id', $request->delivery_person_id)
                ->where('role', 'delivery')
                ->where('is_approved', 1)
                ->firstOrFail();
        }

        $previousRiderId = $order->delivery_person_id;
        $order->delivery_person_id = $request->delivery_person_id;
        $order->save();

        if ($order->delivery_person_id && (int) $previousRiderId !== (int) $order->delivery_person_id) {
            Delivery::updateOrCreate(
                ['order_id' => $order->order_id],
                ['delivery_person_id' => $order->delivery_person_id, 'delivery_status' => 'assigned', 'assigned_at' => now()]
            );
            AdminNotification::record(
                'order_assigned',
                'New order assigned',
                "New order {$order->order_number} has been assigned to you.",
                '/delivery/assigned-orders',
                ['order_id' => $order->order_id],
                $order->delivery_person_id
            );
        }

        return response()->json(['success' => true, 'order' => $order->load('deliveryPerson')]);
    }
}
