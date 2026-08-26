<?php

namespace App\Http\Controllers;

use App\Models\Delivery;
use Illuminate\Http\JsonResponse;

class CashCollectionController extends Controller
{
    public function index(): JsonResponse
    {
        $collections = Delivery::with(['order.customer', 'order.payment', 'deliveryPerson'])
            ->whereHas('order', fn ($order) => $order->where('order_status', 'delivered')->whereHas('payment', fn ($payment) => $payment->where('payment_method', 'COD')))
            ->latest('collected_at')->get();

        return response()->json(['success' => true, 'collections' => $collections]);
    }

    public function settle(Delivery $delivery): JsonResponse
    {
        $delivery->update(['settlement_status' => 'settled', 'settled_at' => now()]);

        return response()->json(['success' => true, 'collection' => $delivery->fresh(['order.customer', 'order.payment', 'deliveryPerson'])]);
    }
}
