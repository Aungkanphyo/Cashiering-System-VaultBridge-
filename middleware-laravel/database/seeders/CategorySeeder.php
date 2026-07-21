<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'category_name' => 'Beverages',
                'tax' => 5.00,
                'discount_category' => 0.00,
                'status' => 'active',
            ],
            [
                'category_name' => 'Snacks & Sweets',
                'tax' => 5.00,
                'discount_category' => 0.00,
                'status' => 'active',
            ],
            [
                'category_name' => 'Instant Foods',
                'tax' => 5.00,
                'discount_category' => 2.00, // 2% category discount
                'status' => 'active',
            ],
            [
                'category_name' => 'Personal Care',
                'tax' => 5.00,
                'discount_category' => 0.00,
                'status' => 'active',
            ],
            [
                'category_name' => 'Household Utilities',
                'tax' => 5.00,
                'discount_category' => 0.00,
                'status' => 'active',
            ],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}