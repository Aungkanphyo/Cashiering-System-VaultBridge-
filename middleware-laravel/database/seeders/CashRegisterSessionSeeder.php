<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CashRegisterSessionSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('cash_register_sessions')->insert([
            [
                'user_id' => 1,
                'opening_time' => now()->subHours(5),
                'closing_time' => null,
                'expected_closing_cash' => 50000,
                'actual_closing_cash' => null,
                'discrepancy' => null,
                'report_text' => 'Morning session',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => 1,
                'opening_time' => now(),
                'closing_time' => null,
                'expected_closing_cash' => 100000,
                'actual_closing_cash' => null,
                'discrepancy' => null,
                'report_text' => 'Evening session',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}