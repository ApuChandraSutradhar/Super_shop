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

it('returns fresh vegetables for both supported category labels', function () {
    $freshVegetable = Product::create([
        'name' => 'Fresh vegetable',
        'category' => 'Fresh Vegetables',
        'price' => 50,
        'description' => 'Fresh vegetable for filtering',
    ]);
    $legacyVegetable = Product::create([
        'name' => 'Legacy vegetable',
        'category' => 'Vegetables',
        'price' => 60,
        'description' => 'Legacy vegetable for filtering',
    ]);
    Product::create([
        'name' => 'Fresh fruit',
        'category' => 'Fresh Fruits',
        'price' => 70,
        'description' => 'Fresh fruit for filtering',
    ]);

    $result = collect($this->getJson('/api/products?category=Fresh%20Vegetables')->assertOk()->json());

    expect($result->pluck('id')->all())
        ->toContain($freshVegetable->id)
        ->toContain($legacyVegetable->id)
        ->not->toContain(Product::where('name', 'Fresh fruit')->value('id'));
});

it('suggests a close product name when a search has no matches', function () {
    Product::create([
        'name' => 'Fresh Apple',
        'price' => 80,
        'description' => 'Fresh apple for search suggestions',
    ]);
    Product::create([
        'name' => 'Apple Fruit (1 kg)',
        'price' => 90,
        'description' => 'Another apple product for search suggestions',
    ]);

    $response = $this->getJson('/api/products?paginate=1&search=Appla');

    $response->assertOk()
        ->assertJsonPath('total', 0)
        ->assertJsonPath('suggestion', 'Apple');

    $this->getJson('/api/products?paginate=1&search=Apple')
        ->assertOk()
        ->assertJsonPath('total', 2);
});
