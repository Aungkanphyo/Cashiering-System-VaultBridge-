<?php

namespace Database\Seeders;

use App\Models\SalePayment;
use Illuminate\Database\Seeder;

class SalePaymentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        SalePayment::create([
            'payment_name' => 'Cash',
            'status' => 'active',
        ]);
    }
}