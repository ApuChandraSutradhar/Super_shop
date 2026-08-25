<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('refunds', function (Blueprint $table) {
            $table->string('order_status_at_request', 30)->nullable()->after('cancellation_status');
            $table->text('admin_remarks')->nullable()->after('reason');
        });
    }

    public function down(): void
    {
        Schema::table('refunds', function (Blueprint $table) {
            $table->dropColumn(['order_status_at_request', 'admin_remarks']);
        });
    }
};
