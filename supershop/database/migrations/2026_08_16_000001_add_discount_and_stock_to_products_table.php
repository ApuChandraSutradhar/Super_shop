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
        Schema::table('products', function (Blueprint $table) {
            if (!Schema::hasColumn('products', 'discount')) {
                $table->decimal('discount', 10, 2)->default(0)->after('price');
            }

            if (!Schema::hasColumn('products', 'stock')) {
                $table->integer('stock')->default(0)->after('discount');
            }

            if (!Schema::hasColumn('products', 'category')) {
                $table->string('category')->nullable()->after('name');
            }

            if (!Schema::hasColumn('products', 'image')) {
                $table->string('image')->nullable()->after('price');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            if (Schema::hasColumn('products', 'discount')) {
                $table->dropColumn('discount');
            }

            if (Schema::hasColumn('products', 'stock')) {
                $table->dropColumn('stock');
            }
        });
    }
};
