<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('refunds', function (Blueprint $table) {
            $table->id('refund_id');
            $table->foreignId('order_id')->unique()->constrained('orders', 'order_id')->cascadeOnDelete();
            $table->foreignId('customer_id')->constrained('users', 'id')->cascadeOnDelete();
            $table->text('reason');
            $table->enum('cancellation_status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->decimal('calculated_refund_amount', 10, 2);
            $table->decimal('deduction_amount', 10, 2)->default(0);
            $table->timestamp('requested_at')->useCurrent();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('refunds');
    }
};
