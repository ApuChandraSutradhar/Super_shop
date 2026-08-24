<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->text('shipping_address')->nullable()->after('delivery_person_id');
            $table->string('delivery_name')->nullable()->after('shipping_address');
            $table->string('delivery_phone', 30)->nullable()->after('delivery_name');
            $table->string('delivery_city')->nullable()->after('delivery_phone');
            $table->text('order_notes')->nullable()->after('delivery_city');
            $table->json('order_items_summary')->nullable()->after('order_notes');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['shipping_address', 'delivery_name', 'delivery_phone', 'delivery_city', 'order_notes', 'order_items_summary']);
        });
    }
};
