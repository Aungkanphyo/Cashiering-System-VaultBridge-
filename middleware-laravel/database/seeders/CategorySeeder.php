<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        DB::table('categories')->insert([
            [
                'category_name'     => 'Grocery & Snacks',                
                'tax'               => 5.00, // 5% Tax
                'discount_category' => 0.00,
                'created_at'        => Carbon::now(),
                'updated_at'        => Carbon::now(),
            ],
            [
                'category_name'     => 'Beverages',
                'tax'               => 5.00,
                'discount_category' => 0.00,
                'created_at'        => Carbon::now(),
                'updated_at'        => Carbon::now(),
            ],
            [
                'category_name'     => 'Personal Care',
                'tax'               => 0.00, // No tax for medicine/personal care
                'discount_category' => 10.00, // 10% category promotion
                'created_at'        => Carbon::now(),
                'updated_at'        => Carbon::now(),
            ]
        ]);
    }
}