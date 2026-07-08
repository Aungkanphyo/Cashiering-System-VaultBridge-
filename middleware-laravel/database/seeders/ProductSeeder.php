<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('products')->insert([
            [
                'category_id'      => 3,
                'barcode'          => '8820123456789',
                'product_name'     => 'Tissue Soft Roll (Pack)',
                'price'            => 6000.00,
                'stock_quantity'   => 150,
                'min_stock_level'  => 20,
                'sale_price'       => 5100.00, 
                'discount_rate'    => 15.00,   
                'discount_price'   => 900.00,  
                'status'           => 'active',
                'created_at'       => Carbon::now(),
                'updated_at'       => Carbon::now(),
            ],
            [
                'category_id'      => 3,
                'barcode'          => '882012345',
                'product_name'     => 'Premier Facial Tissue',
                'price'            => 2500.00,
                'stock_quantity'   => 80,
                'min_stock_level'  => 15,
                'sale_price'       => 2500.00, 
                'discount_rate'    => 0.00,
                'discount_price'   => 0.00,
                'status'           => 'active',
                'created_at'       => Carbon::now(),
                'updated_at'       => Carbon::now(),
            ],
            [
                'category_id'      => 2,
                'barcode'          => '882098765',
                'product_name'     => 'Coca-Cola 390ml',
                'price'            => 1200.00,
                'stock_quantity'   => 300,
                'min_stock_level'  => 50,
                'sale_price'       => 1200.00,
                'discount_rate'    => 0.00,
                'discount_price'   => 0.00,
                'status'           => 'active',
                'created_at'       => Carbon::now(),
                'updated_at'       => Carbon::now(),
            ],
            [
                'category_id'      => 2,
                'barcode'          => '882098766',
                'product_name'     => 'Nescafe Ice 240ml',
                'price'            => 1800.00,
                'stock_quantity'   => 12,
                'min_stock_level'  => 20,
                'sale_price'       => 1710.00, 
                'discount_rate'    => 5.00,
                'discount_price'   => 900.00,
                'status'           => 'active',
                'created_at'       => Carbon::now(),
                'updated_at'       => Carbon::now(),
            ],
            [
                'category_id'      => 1,
                'barcode'          => '882045612',
                'product_name'     => 'Yum Yum Instant Noodles (Chicken)',
                'price'            => 700.00,
                'stock_quantity'   => 0,
                'min_stock_level'  => 30,
                'sale_price'       => 700.00,
                'discount_rate'    => 0.00,
                'discount_price'   => 0.00,
                'status'           => 'inactive',
                'created_at'       => Carbon::now(),
                'updated_at'       => Carbon::now(),
            ]
        ]);
    }
}