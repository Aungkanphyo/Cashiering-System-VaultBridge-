<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        DB::table('categories')->insert([
            [
                'category_name' => 'Food',
                'tax' => 5,
                'discount_category' => 10,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'category_name' => 'Drink',
                'tax' => 5,
                'discount_category' => 5,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}