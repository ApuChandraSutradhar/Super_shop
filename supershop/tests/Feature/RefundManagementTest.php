<?php

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use App\Models\User;

it('calculates a shipping cancellation refund and cancels the order when approved', function () {
    $customer = User::factory()->create();
    $product = Product::create([
        'name' => 'Refundable product',
        'price' => 500,
        'description' => 'Test product',
    ]);
    $order = Order::factory()->for($customer, 'customer')->create([
        'order_status' => 'shipping',
        'delivery_city' => 'Outside Dhaka',
        'total_amount' => 500,
        'payable_amount' => 620,
    ]);
    OrderItem::create([
        'order_id' => $order->order_id,
        'product_id' => $product->id,
        'quantity' => 1,
        'unit_price' => 500,
        'subtotal' => 500,
    ]);
    Payment::create([
        'order_id' => $order->order_id,
        'payment_method' => 'bKash',
        'payment_status' => 'paid',
        'transaction_id' => 'BK12345678',
        'sender_number' => '01700000000',
        'amount' => 620,
    ]);

    $response = $this->postJson('/api/refunds', [
        'order_id' => $order->order_id,
        'customer_id' => $customer->id,
        'reason' => 'No longer required',
    ]);

    $response->assertCreated()
        ->assertJsonPath('refund.deduction_amount', '170.00')
        ->assertJsonPath('refund.calculated_refund_amount', '330.00');

    $refundId = $response->json('refund.refund_id');
    $this->getJson("/api/refunds/{$order->order_id}?customer_id={$customer->id}")
        ->assertOk()
        ->assertJsonPath('refund.payment_method', 'bKash')
        ->assertJsonPath('refund.sender_number', '01700000000')
        ->assertJsonPath('refund.original_amount', 500)
        ->assertJsonPath('refund.order_status_at_request', 'shipping');

    $this->patchJson("/api/admin/refunds/{$refundId}/status", ['cancellation_status' => 'approved'])
        ->assertOk()
        ->assertJsonPath('refund.cancellation_status', 'approved');

    $this->assertDatabaseHas('orders', ['order_id' => $order->order_id, 'order_status' => 'cancelled']);
});
