<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\Refund;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Refund>
 */
class RefundFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'order_id' => Order::factory(),
            'customer_id' => User::factory(),
            'reason' => fake()->sentence(),
            'cancellation_status' => 'pending',
            'calculated_refund_amount' => fake()->randomFloat(2, 1, 1000),
            'deduction_amount' => 0,
            'requested_at' => now(),
        ];
    }
}
