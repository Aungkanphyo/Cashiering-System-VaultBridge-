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
        Schema::create('products', function (Blueprint $table) {
            $table->id('product_id');
            // Foreign key to categories table
            $table->foreignId('category_id')->constrained('categories', 'category_id')->onDelete('cascade');

            $table->string('barcode')->unique();
            $table->string('product_name');
            $table->decimal('price', 15, 2);
            $table->integer('stock_quantity');
            $table->integer('min_stock_level')->default(0);
            $table->decimal('sale_price', 15, 2);
            $table->decimal('discount_rate', 5, 2)->default(0);
            $table->decimal('discount_price', 15, 2)->default(0);
            $table->string('status');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
