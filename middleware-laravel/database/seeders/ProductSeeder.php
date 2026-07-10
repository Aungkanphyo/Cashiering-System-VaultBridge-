<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('products')->insert([
            [
                'category_id' => 1,
                'barcode' => '100001',
                'product_name' => 'Coffee',
                'price' => 3000,
                'stock_quantity' => 100,
                'min_stock_level' => 10,
                'sale_price' => 3500,
                'discount_rate' => 0,
                'discount_price' => 0,
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'category_id' => 2,
                'barcode' => '100002',
                'product_name' => 'Tea',
                'price' => 2000,
                'stock_quantity' => 100,
                'min_stock_level' => 10,
                'sale_price' => 2500,
                'discount_rate' => 5,
                'discount_price' => 125,
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}