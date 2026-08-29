<?php

use App\Models\Feedback;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;

it('returns each product feedback average and review count', function () {
    $customer = User::factory()->create();
    $ratedProduct = Product::create([
        'name' => 'Rated product',
        'price' => 120,
        'description' => 'Product with customer feedback',
    ]);
    $unratedProduct = Product::create([
        'name' => 'Unrated product',
        'price' => 80,
        'description' => 'Product without customer feedback',
    ]);
    $firstOrder = Order::factory()->for($customer, 'customer')->create();
    $secondOrder = Order::factory()->for($customer, 'customer')->create();

    Feedback::create([
        'order_id' => $firstOrder->order_id,
        'product_id' => $ratedProduct->id,
        'customer_id' => $customer->id,
        'rating_stars' => 5,
    ]);
    Feedback::create([
        'order_id' => $secondOrder->order_id,
        'product_id' => $ratedProduct->id,
        'customer_id' => $customer->id,
        'rating_stars' => 3,
    ]);

    $products = collect($this->getJson('/api/products')->assertOk()->json());
    $ratedResult = $products->firstWhere('id', $ratedProduct->id);
    $unratedResult = $products->firstWhere('id', $unratedProduct->id);

    expect((float) $ratedResult['rating'])->toBe(4.0)
        ->and($ratedResult['review'])->toBe(2)
        ->and($unratedResult['rating'])->toBeNull()
        ->and($unratedResult['review'])->toBe(0);
});

it('paginates product results when requested', function () {
    $this->getJson('/api/products?paginate=1&per_page=12')
        ->assertOk()
        ->assertJsonPath('per_page', 12)
        ->assertJsonStructure(['data', 'current_page', 'last_page', 'total']);
});
