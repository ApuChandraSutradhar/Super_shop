<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id('order_id'); // Primary Key (order_id)
            $table->string('order_number')->unique(); // যেমন: FM-666815
            
            // users টেবিলের সাথে ফরেন কি সম্পর্ক
            $table->foreignId('customer_id')->constrained('users', 'id')->onDelete('cascade');
            
            $table->decimal('total_amount', 10, 2);
            $table->decimal('discount_amount', 10, 2)->default(0.00);
            $table->decimal('payable_amount', 10, 2);
            
            $table->enum('order_status', ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])->default('pending');
            
            // ERD অনুযায়ী ঐচ্ছিক ফিল্ডসমূহ
            $table->unsignedBigInteger('coupon_id')->nullable();
            $table->unsignedBigInteger('delivery_person_id')->nullable();
            
            $table->timestamps(); // created_at (order_date হিসেবে কাজ করবে) ও updated_at
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};