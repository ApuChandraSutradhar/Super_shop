<?php

namespace App\Http\Controllers;

use App\Models\AdminNotification;
use App\Models\Order;
use App\Models\Refund;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RefundController extends Controller
{
    private const CANCELLABLE_STATUSES = ['pending', 'confirmed', 'processing', 'packing', 'shipping', 'shipped'];

    /**
     * Create a customer cancellation request using the order status at the time of request.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'order_id' => ['required', 'integer', 'exists:orders,order_id'],
            'customer_id' => ['required', 'integer', 'exists:users,id'],
            'reason' => ['required', 'string', 'max:2000'],
        ]);

        $refund = DB::transaction(function () use ($validated): Refund {
            $order = Order::query()
                ->where('order_id', $validated['order_id'])
                ->where('customer_id', $validated['customer_id'])
                ->lockForUpdate()
                ->first();

            if (! $order) {
                abort(403, 'This order does not belong to the selected customer.');
            }

            $status = strtolower((string) $order->order_status);
            if ($status === 'delivered') {
                abort(422, 'Delivered orders cannot be cancelled through this flow.');
            }

            if (! in_array($status, self::CANCELLABLE_STATUSES, true)) {
                abort(422, 'This order is no longer eligible for cancellation.');
            }

            if (Refund::query()->where('order_id', $order->order_id)->exists()) {
                abort(422, 'A cancellation request already exists for this order.');
            }

            $productTotal = (float) $order->orderItems()->sum('subtotal');
            $deduction = $this->calculateDeduction($status, $productTotal, $order->delivery_city);

            return Refund::create([
                'order_id' => $order->order_id,
                'customer_id' => $order->customer_id,
                'reason' => $validated['reason'],
                'cancellation_status' => 'pending',
                'order_status_at_request' => $status,
                'calculated_refund_amount' => max(0, round($productTotal - $deduction, 2)),
                'deduction_amount' => round($deduction, 2),
                'requested_at' => now(),
            ]);
        });

        AdminNotification::record(
            'refund_request',
            'New cancellation request',
            "Order {$refund->order_id} has a new cancellation request.",
            '/admin/refunds',
            ['refund_id' => $refund->refund_id, 'order_id' => $refund->order_id]
        );

        return response()->json(['success' => true, 'refund' => $refund], 201);
    }

    public function index()
    {
        $refunds = Refund::with(['order.payment', 'customer'])
            ->latest('requested_at')
            ->get();

        return response()->json([
            'success' => true,
            'refunds' => $refunds->map(fn (Refund $refund) => $this->refundPayload($refund)),
        ]);
    }

    public function showForCustomer(Request $request, int $orderId)
    {
        $validated = $request->validate([
            'customer_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        $refund = Refund::with(['order.payment', 'customer'])
            ->where('order_id', $orderId)
            ->where('customer_id', $validated['customer_id'])
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'refund' => $this->refundPayload($refund),
        ]);
    }

    public function updateStatus(Request $request, Refund $refund)
    {
        $validated = $request->validate([
            'cancellation_status' => ['required', 'in:approved,rejected'],
            'admin_remarks' => ['nullable', 'string', 'max:2000'],
        ]);

        $updatedRefund = DB::transaction(function () use ($refund, $validated): Refund {
            $lockedRefund = Refund::query()->lockForUpdate()->findOrFail($refund->refund_id);

            if ($lockedRefund->cancellation_status !== 'pending') {
                abort(422, 'Only pending cancellation requests can be reviewed.');
            }

            $lockedRefund->cancellation_status = $validated['cancellation_status'];
            $lockedRefund->admin_remarks = $validated['admin_remarks'] ?? $lockedRefund->admin_remarks;
            $lockedRefund->save();

            if ($lockedRefund->cancellation_status === 'approved') {
                Order::query()->where('order_id', $lockedRefund->order_id)->update(['order_status' => 'cancelled']);
            }

            return $lockedRefund->load(['order.payment', 'customer']);
        });

        return response()->json([
            'success' => true,
            'message' => 'Cancellation request updated successfully.',
            'refund' => $this->refundPayload($updatedRefund),
        ]);
    }

    private function calculateDeduction(string $status, float $productTotal, ?string $deliveryCity): float
    {
        return match ($status) {
            'confirmed' => $productTotal * 0.05,
            'processing', 'packing' => $productTotal * 0.10,
            'shipping', 'shipped' => ($productTotal * 0.10) + $this->deliveryCharge($deliveryCity),
            default => 0.0,
        };
    }

    private function deliveryCharge(?string $deliveryCity): float
    {
        return strtolower(trim((string) $deliveryCity)) === 'dhaka' ? 60.0 : 120.0;
    }

    private function refundPayload(Refund $refund): Refund
    {
        $refund->setAttribute('payment_method', $refund->order?->payment?->payment_method);
        $refund->setAttribute('sender_number', $refund->order?->payment?->sender_number);
        $refund->setAttribute('payable_amount', $refund->order?->payable_amount);
        $originalAmount = (float) ($refund->order?->orderItems()->sum('subtotal') ?? 0);
        $refund->setAttribute('original_amount', round($originalAmount, 2));
        $refund->setAttribute('deduction_percentage', $originalAmount > 0 ? round(((float) $refund->deduction_amount / $originalAmount) * 100, 2) : 0);
        $refund->setAttribute('cancellation_date', $refund->requested_at);

        return $refund;
    }
}
