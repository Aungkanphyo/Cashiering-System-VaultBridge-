<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class VoucherDetailsSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('voucher_details')->insert([
            [
                'voucher_id' => 1,
                'product_id' => 1,
                'quantity' => 2,
                'sub_total' => 7000,
                'unit_price' => 3500,
                'total_discount' => 0,
                'total' => 7000,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'voucher_id' => 2,
                'product_id' => 2,
                'quantity' => 1,
                'sub_total' => 2500,
                'unit_price' => 2500,
                'total_discount' => 0,
                'total' => 2500,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}