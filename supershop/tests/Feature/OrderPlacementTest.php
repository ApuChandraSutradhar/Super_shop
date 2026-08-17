<?php

use App\Models\Product;
use App\Models\User;

it('places an order with normalized payment methods and stores coupon data safely', function () {
    $user = User::factory()->create();
    $product = Product::create([
        'name' => 'Demo Product',
        'price' => 1500,
        'description' => 'Test product',
    ]);

    $payload = [
        'customer_id' => $user->id,
        'total_amount' => 1500,
        'discount_amount' => 100,
        'payable_amount' => 1400,
        'payment_method' => 'bkash',
        'transaction_id' => 'BK12345678',
        'coupon_code' => 'AUTO2000_OFFER',
        'is_used' => 1,
        'items' => [
            [
                'product_id' => $product->id,
                'quantity' => 1,
                'unit_price' => 1500,
            ],
        ],
    ];

    $first = $this->postJson('/api/place-order', $payload);
    $first->assertStatus(201);
    $first->assertJsonPath('success', true);

    $second = $this->postJson('/api/place-order', $payload);
    $second->assertStatus(201);
    $second->assertJsonPath('success', true);

    $this->assertDatabaseHas('orders', ['customer_id' => $user->id]);
    $this->assertDatabaseHas('payments', ['payment_method' => 'bKash', 'transaction_id' => 'BK12345678']);
    $this->assertDatabaseHas('coupons', ['coupon_code' => 'AUTO2000_OFFER', 'user_id' => $user->id]);
});

it('stores a coupon record when a coupon code is provided even with zero discount', function () {
    $user = User::factory()->create();
    $product = Product::create([
        'name' => 'Zero Discount Product',
        'price' => 1200,
        'description' => 'Coupon-only tracking',
    ]);

    $payload = [
        'customer_id' => $user->id,
        'total_amount' => 1200,
        'discount_amount' => 0,
        'payable_amount' => 1200,
        'payment_method' => 'COD',
        'coupon_code' => 'WELCOME10',
        'is_used' => 0,
        'items' => [
            [
                'product_id' => $product->id,
                'quantity' => 1,
                'unit_price' => 1200,
            ],
        ],
    ];

    $response = $this->postJson('/api/place-order', $payload);

    $response->assertStatus(201);
    $this->assertDatabaseHas('coupons', ['coupon_code' => 'WELCOME10', 'user_id' => $user->id]);
});
