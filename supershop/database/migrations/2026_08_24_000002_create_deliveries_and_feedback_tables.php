<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->foreign('delivery_person_id')->references('id')->on('users')->nullOnDelete();
        });

        Schema::create('deliveries', function (Blueprint $table) {
            $table->id('delivery_id');
            $table->foreignId('order_id')->unique()->constrained('orders', 'order_id')->cascadeOnDelete();
            $table->foreignId('delivery_person_id')->constrained('users', 'id')->restrictOnDelete();
            $table->string('otp_code', 12)->nullable();
            $table->decimal('cash_collected', 10, 2)->default(0);
            $table->enum('delivery_status', ['assigned', 'out_for_delivery', 'delivered'])->default('assigned');
            $table->timestamps();
        });

        Schema::create('feedback', function (Blueprint $table) {
            $table->id('review_id');
            $table->foreignId('order_id')->constrained('orders', 'order_id')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained('products', 'id')->cascadeOnDelete();
            $table->foreignId('customer_id')->constrained('users', 'id')->cascadeOnDelete();
            $table->unsignedTinyInteger('rating_stars');
            $table->text('comment')->nullable();
            $table->timestamps();
            $table->unique(['order_id', 'product_id', 'customer_id'], 'feedback_order_product_customer_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('feedback');
        Schema::dropIfExists('deliveries');
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['delivery_person_id']);
        });
    }
};
