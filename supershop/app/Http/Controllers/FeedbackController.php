<?php

namespace App\Http\Controllers;

use App\Models\Feedback;
use App\Models\Order;
use Illuminate\Http\Request;

class FeedbackController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'order_id' => ['required', 'integer', 'exists:orders,order_id'],
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'customer_id' => ['required', 'integer', 'exists:users,id'],
            'rating_stars' => ['required', 'integer', 'between:1,5'],
            'comment' => ['nullable', 'string', 'max:1000'],
        ]);

        $order = Order::where('order_id', $data['order_id'])
            ->where('customer_id', $data['customer_id'])
            ->where('order_status', 'delivered')
            ->whereHas('orderItems', fn ($query) => $query->where('product_id', $data['product_id']))
            ->firstOrFail();

        $feedback = Feedback::updateOrCreate(
            ['order_id' => $order->order_id, 'product_id' => $data['product_id'], 'customer_id' => $data['customer_id']],
            ['rating_stars' => $data['rating_stars'], 'comment' => $data['comment'] ?? null]
        );

        return response()->json(['success' => true, 'message' => 'Thank you for your feedback!', 'feedback' => $feedback]);
    }
}
