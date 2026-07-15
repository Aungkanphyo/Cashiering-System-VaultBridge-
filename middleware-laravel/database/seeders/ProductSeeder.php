<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = [
            // Category 1: Beverages (category_id: 1)
            [
                'category_id' => 1,
                'barcode' => 8850123456781,
                'product_name' => 'Coca-Cola 325ml',
                'price' => 800.00,
                'sale_price' => 1200.00,
                'discount_rate' => 0.00,
                'discount_price' => 1200.00,
                'stock_quantity' => 150,
                'min_stock_level' => 20,
                'status' => 'active',
            ],
            [
                'category_id' => 1,
                'barcode' => 8850123456782,
                'product_name' => 'Pepsi 325ml',
                'price' => 800.00,
                'sale_price' => 1200.00,
                'discount_rate' => 5.00, // 5% discount
                'discount_price' => 1140.00,
                'stock_quantity' => 120,
                'min_stock_level' => 20,
                'status' => 'active',
            ],
            [
                'category_id' => 1,
                'barcode' => 8850123456783,
                'product_name' => 'Sunkist Orange 400ml',
                'price' => 1000.00,
                'sale_price' => 1500.00,
                'discount_rate' => 0.00,
                'discount_price' => 1500.00,
                'stock_quantity' => 80,
                'min_stock_level' => 15,
                'status' => 'active',
            ],
            [
                'category_id' => 1,
                'barcode' => 8850123456784,
                'product_name' => 'Oishi Green Tea 500ml',
                'price' => 1200.00,
                'sale_price' => 1800.00,
                'discount_rate' => 10.00,
                'discount_price' => 1620.00,
                'stock_quantity' => 100,
                'min_stock_level' => 15,
                'status' => 'active',
            ],
            [
                'category_id' => 1,
                'barcode' => 8850123456785,
                'product_name' => 'Alpine Purified Water 1L',
                'price' => 400.00,
                'sale_price' => 700.00,
                'discount_rate' => 0.00,
                'discount_price' => 700.00,
                'stock_quantity' => 300,
                'min_stock_level' => 50,
                'status' => 'active',
            ],

            // Category 2: Snacks & Sweets (category_id: 2)
            [
                'category_id' => 2,
                'barcode' => 8850123456791,
                'product_name' => 'Lays Classic Salted 50g',
                'price' => 1500.00,
                'sale_price' => 2200.00,
                'discount_rate' => 0.00,
                'discount_price' => 2200.00,
                'stock_quantity' => 90,
                'min_stock_level' => 15,
                'status' => 'active',
            ],
            [
                'category_id' => 2,
                'barcode' => 8850123456792,
                'product_name' => 'Pringles Sour Cream 107g',
                'price' => 3500.00,
                'sale_price' => 4800.00,
                'discount_rate' => 0.00,
                'discount_price' => 4800.00,
                'stock_quantity' => 60,
                'min_stock_level' => 10,
                'status' => 'active',
            ],
            [
                'category_id' => 2,
                'barcode' => 8850123456793,
                'product_name' => 'Oreo Chocolate Sandwich 133g',
                'price' => 1200.00,
                'sale_price' => 1800.00,
                'discount_rate' => 0.00,
                'discount_price' => 1800.00,
                'stock_quantity' => 110,
                'min_stock_level' => 20,
                'status' => 'active',
            ],

            // Category 3: Instant Foods (category_id: 3)
            [
                'category_id' => 3,
                'barcode' => 8850123456801,
                'product_name' => 'Mama Instant Noodles Shrimp 60g',
                'price' => 400.00,
                'sale_price' => 600.00,
                'discount_rate' => 0.00,
                'discount_price' => 600.00,
                'stock_quantity' => 250,
                'min_stock_level' => 40,
                'status' => 'active',
            ],
            [
                'category_id' => 3,
                'barcode' => 8850123456802,
                'product_name' => 'Yum Yum Duck Flavor 60g',
                'price' => 400.00,
                'sale_price' => 600.00,
                'discount_rate' => 0.00,
                'discount_price' => 600.00,
                'stock_quantity' => 200,
                'min_stock_level' => 40,
                'status' => 'active',
            ],
            [
                'category_id' => 3,
                'barcode' => 8850123456803,
                'product_name' => 'Premier Coffee 3in1 (30 Packs)',
                'price' => 4500.00,
                'sale_price' => 6500.00,
                'discount_rate' => 8.00,
                'discount_price' => 5980.00,
                'stock_quantity' => 50,
                'min_stock_level' => 10,
                'status' => 'active',
            ],

            // Category 4: Personal Care (category_id: 4)
            [
                'category_id' => 4,
                'barcode' => 8850123456811,
                'product_name' => 'Colgate Great Regular Flavor 150g',
                'price' => 1800.00,
                'sale_price' => 2500.00,
                'discount_rate' => 0.00,
                'discount_price' => 2500.00,
                'stock_quantity' => 70,
                'min_stock_level' => 12,
                'status' => 'active',
            ],
            [
                'category_id' => 4,
                'barcode' => 8850123456812,
                'product_name' => 'Sunsilk Smooth & Manageable 320ml',
                'price' => 4500.00,
                'sale_price' => 6000.00,
                'discount_rate' => 10.00,
                'discount_price' => 5400.00,
                'stock_quantity' => 40,
                'min_stock_level' => 8,
                'status' => 'active',
            ],

            // Category 5: Household Utilities (category_id: 5)
            [
                'category_id' => 5,
                'barcode' => 8850123456821,
                'product_name' => 'Sunlight Dishwashing Liquid 750ml',
                'price' => 2200.00,
                'sale_price' => 3200.00,
                'discount_rate' => 0.00,
                'discount_price' => 3200.00,
                'stock_quantity' => 60,
                'min_stock_level' => 10,
                'status' => 'active',
            ],
        ];

        foreach ($products as $product) {
            Product::create($product);
        }
    }
}