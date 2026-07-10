<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class VoucherSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('vouchers')->insert([
            [
                'session_id' => 1,
                'payment_id' => 1,
                'sale_date' => now(),
                'final_amount' => 6000,
                'status' => 'completed',
                'void_reason' => null,
                'voided_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'session_id' => 1,
                'payment_id' => 2,
                'sale_date' => now(),
                'final_amount' => 2500,
                'status' => 'completed',
                'void_reason' => null,
                'voided_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}