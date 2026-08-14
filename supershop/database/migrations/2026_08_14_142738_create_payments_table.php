<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id('payment_id'); // Primary Key
            
            // orders টেবিলের সাথে Foreign Key
            $table->foreignId('order_id')->constrained('orders', 'order_id')->onDelete('cascade');
            
            $table->enum('payment_method', ['COD', 'bKash', 'Nagad', 'Card']);
            $table->enum('payment_status', ['pending', 'paid', 'failed'])->default('pending');
            $table->string('transaction_id')->nullable(); // bKash/Nagad এর TrxID এর জন্য
            $table->decimal('amount', 10, 2);
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};