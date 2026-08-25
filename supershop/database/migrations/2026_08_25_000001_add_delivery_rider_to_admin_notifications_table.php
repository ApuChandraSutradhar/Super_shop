<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('admin_notifications', function (Blueprint $table) {
            $table->foreignId('delivery_rider_id')->nullable()->after('id')->constrained('users')->nullOnDelete();
            $table->index(['delivery_rider_id', 'is_read', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::table('admin_notifications', function (Blueprint $table) {
            $table->dropForeign(['delivery_rider_id']);
            $table->dropIndex(['delivery_rider_id', 'is_read', 'created_at']);
            $table->dropColumn('delivery_rider_id');
        });
    }
};
