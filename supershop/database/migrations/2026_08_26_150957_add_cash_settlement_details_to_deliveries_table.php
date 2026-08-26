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
        Schema::table('deliveries', function (Blueprint $table) {
            $table->enum('settlement_status', ['pending', 'settled'])->default('pending')->after('cash_collected');
            $table->timestamp('collected_at')->nullable()->after('settlement_status');
            $table->timestamp('settled_at')->nullable()->after('collected_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('deliveries', function (Blueprint $table) {
            $table->dropColumn(['settlement_status', 'collected_at', 'settled_at']);
        });
    }
};
