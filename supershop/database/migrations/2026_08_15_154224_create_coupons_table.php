<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('coupons', function (Blueprint $table) {
            $table->id('coupon_id');
            
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('cascade'); 
            
            $table->string('coupon_code')->unique();
            $table->decimal('discount_amount', 10, 2)->default(100.00);
            $table->decimal('min_purchase_amount', 10, 2)->default(2000.00);
            $table->date('valid_until');
            $table->boolean('is_used')->default(false); //
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('coupons');
    }
};