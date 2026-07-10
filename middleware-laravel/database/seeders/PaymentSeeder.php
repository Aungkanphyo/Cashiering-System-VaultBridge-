<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PaymentSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('sale_payments')->insert([
            [
                'payment_name' => 'Cash',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'payment_name' => 'KBZ Pay',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}