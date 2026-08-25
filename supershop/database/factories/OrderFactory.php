<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    public function definition(): array
    {
        return [
            'order_number' => 'FM-'.fake()->unique()->numerify('######'),
            'customer_id' => User::factory(),
            'total_amount' => 100,
            'discount_amount' => 0,
            'payable_amount' => 100,
            'order_status' => 'pending',
            'delivery_name' => fake()->name(),
            'delivery_phone' => fake()->numerify('01#########'),
            'delivery_city' => 'Dhaka',
            'shipping_address' => fake()->address(),
            'order_items_summary' => [],
        ];
    }
}
