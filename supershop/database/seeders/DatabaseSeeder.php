<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create Super Admin User
        User::updateOrCreate(
            ['phone' => '01700000001'],
            [
                'name' => 'Super Admin',
                'email' => 'admin@supershop.com',
                'phone' => '01700000001',
                'password' => Hash::make('admin@123'), // Password: admin@123
                'role' => 'admin',
            ]
        );

        // Create Delivery Personnel
        User::updateOrCreate(
            ['phone' => '01700000002'],
            [
                'name' => 'Delivery Manager',
                'email' => 'delivery@supershop.com',
                'phone' => '01700000002',
                'password' => Hash::make('delivery@123'), // Password: delivery@123
                'role' => 'delivery',
            ]
        );

        // Create Test Customer
        User::updateOrCreate(
            ['phone' => '01700000003'],
            [
                'name' => 'Test Customer',
                'email' => 'customer@supershop.com',
                'phone' => '01700000003',
                'password' => Hash::make('customer@123'), // Password: customer@123
                'role' => 'customer',
            ]
        );

        // Uncomment to generate additional test customers
        // User::factory(10)->create();
    }
}
