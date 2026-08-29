<?php

use App\Models\Notification;
use App\Models\Order;
use App\Models\User;

it('creates and returns a customer notification after an order status update', function () {
    $customer = User::factory()->create();
    $order = Order::factory()->for($customer, 'customer')->create(['order_status' => 'pending']);

    $this->patchJson("/api/admin/orders/{$order->order_id}/status", ['order_status' => 'confirmed'])
        ->assertOk();

    $this->assertDatabaseHas('notifications', [
        'user_id' => $customer->id,
        'order_id' => $order->order_id,
        'title' => 'Order Status Updated',
        'is_read' => false,
    ]);

    $this->actingAs($customer, 'sanctum')
        ->getJson('/api/notifications')
        ->assertOk()
        ->assertJsonPath('unread_count', 1)
        ->assertJsonPath('notifications.0.order_id', $order->order_id);
});

it('marks only the current customers notifications as read', function () {
    $customer = User::factory()->create();
    $anotherCustomer = User::factory()->create();
    $notification = Notification::create(['user_id' => $customer->id, 'title' => 'Order Status Updated', 'message' => 'Your order was updated.']);
    $otherNotification = Notification::create(['user_id' => $anotherCustomer->id, 'title' => 'Order Status Updated', 'message' => 'Your order was updated.']);

    $this->actingAs($customer, 'sanctum')
        ->postJson('/api/notifications/mark-read', ['notification_ids' => [$notification->id, $otherNotification->id]])
        ->assertOk();

    $this->assertDatabaseHas('notifications', ['id' => $notification->id, 'is_read' => true]);
    $this->assertDatabaseHas('notifications', ['id' => $otherNotification->id, 'is_read' => false]);
});
