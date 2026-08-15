<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('coupons', function (Blueprint $table) {
            $table->id('coupon_id'); // ERD Attribute
            
            // User-এর সাথে কুপনের Foreign Key রিলেশন
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('cascade'); 
            
            $table->string('coupon_code')->unique(); // ERD Attribute
            $table->decimal('discount_amount', 10, 2)->default(100.00); // ৳১০০ ডিসকাউন্ট
            $table->decimal('min_purchase_amount', 10, 2)->default(2000.00); // ERD Attribute (৳২০০০)
            $table->date('valid_until'); // ERD Attribute
            $table->boolean('is_used')->default(false); // কুপন একবার ব্যবহার করলে true হয়ে যাবে
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('coupons');
    }
};