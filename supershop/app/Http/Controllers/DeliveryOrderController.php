<?php

namespace App\Http\Controllers;

use App\Models\Delivery;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\Request;

class DeliveryOrderController extends Controller
{
    private function validateRider(Request $request): int
    {
        $data = $request->validate(['delivery_person_id' => ['required', 'integer', 'exists:users,id']]);
        User::whereKey($data['delivery_person_id'])->where('role', 'delivery')->where('is_approved', 1)->firstOrFail();
        return (int) $data['delivery_person_id'];
    }

    public function dashboard(Request $request)
    {
        $riderId = $this->validateRider($request);
        $today = now()->toDateString();
        $todayOrders = Order::where('delivery_person_id', $riderId)->whereDate('created_at', $today);

        $completed = (clone $todayOrders)->where(function ($query) {
            $query->where('order_status', 'delivered')->orWhereHas('delivery', fn ($delivery) => $delivery->where('delivery_status', 'delivered'));
        });

        $cashCollected = (clone $completed)
            ->whereHas('payment', fn ($payment) => $payment->where('payment_method', 'COD'))
            ->sum('total_amount');

        return response()->json(['success' => true, 'stats' => [
            'today_deliveries' => (clone $todayOrders)->count(),
            'completed' => $completed->count(),
            'pending' => (clone $todayOrders)->whereIn('order_status', ['pending', 'confirmed', 'processing', 'packing', 'shipping', 'shipped'])->count(),
            'cash_collected' => (float) $cashCollected,
        ]]);
    }

    public function assignedOrders(Request $request)
    {
        $riderId = $this->validateRider($request);
        $scope = $request->string('scope', 'active')->toString();

        $orders = Order::with(['customer', 'orderItems.product', 'payment', 'delivery'])
            ->where('delivery_person_id', $riderId)
            ->when($scope === 'completed', fn ($query) => $query->where('order_status', 'delivered'))
            ->when($scope !== 'completed', fn ($query) => $query->whereNotIn('order_status', ['delivered', 'cancelled']))
            ->latest('order_id')
            ->get();

        return response()->json(['success' => true, 'orders' => $orders]);
    }

    public function updateStatus(Request $request, $orderId)
    {
        $data = $request->validate([
            'delivery_person_id' => ['required', 'integer', 'exists:users,id'],
            'order_status' => ['required', 'in:pending,confirmed,processing,packing,shipping,delivered'],
            'cash_collected' => ['nullable', 'numeric', 'min:0'],
        ]);
        User::whereKey($data['delivery_person_id'])->where('role', 'delivery')->where('is_approved', 1)->firstOrFail();

        $order = Order::where('order_id', $orderId)
            ->where('delivery_person_id', $data['delivery_person_id'])
            ->firstOrFail();

        $order->order_status = $data['order_status'];
        $order->save();

        $delivery = Delivery::updateOrCreate(
            ['order_id' => $order->order_id],
            [
                'delivery_person_id' => $data['delivery_person_id'],
                'otp_code' => $data['order_status'] === 'delivered' ? (string) random_int(100000, 999999) : null,
                'cash_collected' => $data['order_status'] === 'delivered' ? ($data['cash_collected'] ?? 0) : 0,
                'delivery_status' => match ($data['order_status']) {
                    'delivered' => 'delivered',
                    'shipping' => 'out_for_delivery',
                    default => 'assigned',
                },
            ]
        );

        return response()->json(['success' => true, 'order' => $order->load('delivery'), 'delivery' => $delivery]);
    }
}
