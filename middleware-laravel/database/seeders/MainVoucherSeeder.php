<?php

namespace Database\Seeders;

use App\Models\SalePayment;
use App\Models\Voucher;
use App\Models\VoucherDetail;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MainVoucherSeeder extends Seeder 
{
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        DB::table('sale_payments')->truncate();
        DB::table('vouchers')->truncate();
        DB::table('voucher_details')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $cashierId = DB::table('users')->where('username', 'cashier1')->value('user_id') ?? 1;

        $sessionId = DB::table('cash_register_sessions')->insertGetId([
            'user_id' => $cashierId,
            'opening_time' => Carbon::now()->subDays(1),
            'closing_time' => null,
            'expected_closing_cash' => 0,
            'actual_closing_cash' => null,
            'discrepancy' => null,
            'report_text' => 'Active Session for Sales History',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $cashPayment = SalePayment::create(['payment_name' => 'Cash', 'status' => 'ACTIVE']);
        $kpayPayment = SalePayment::create(['payment_name' => 'KPay', 'status' => 'ACTIVE']);

        $pTissue       = DB::table('products')->where('barcode', '8820123456789')->first();
        $pFacialTissue = DB::table('products')->where('barcode', '882012345')->first();
        $pCoke         = DB::table('products')->where('barcode', '882098765')->first();
        $pNescafe      = DB::table('products')->where('barcode', '882098766')->first();

        $v1 = Voucher::create([
            'session_id' => $sessionId,
            'payment_id' => $cashPayment->payment_id,
            'sale_date' => Carbon::create(2006, 6, 6, 9, 15, 30),
            'status' => 'COMPLETED',
            'change' => 6000.00, // ပေးငွေ ၃၀၀၀၀၊ အကြွေ ၆၀၀၀
            'payment_received' => 30000.00,
        ]);
        VoucherDetail::create([
            'voucher_id' => $v1->voucher_id,
            'product_id' => $pCoke->product_id,
            'quantity' => 2,
            'unit_price' => $pCoke->price,
            'sub_total' => 2400.00,
            'total' => 2400.00,
        ]);

        $v2 = Voucher::create([
            'session_id' => $sessionId,
            'payment_id' => $kpayPayment->payment_id,
            'sale_date' => Carbon::create(2026, 7, 7, 11, 30, 10),
            'status' => 'COMPLETED',
            'change' => 0.00,
            'payment_received' => 12600.00,
        ]);
        VoucherDetail::create([
            'voucher_id' => $v2->voucher_id,
            'product_id' => $pTissue->product_id,
            'quantity' => 1,
            'unit_price' => $pTissue->price, // 6000
            'sub_total' => 6000.00,
            'total' => 5100.00, // Discount နှုတ်ပြီးဈေး
        ]);
        VoucherDetail::create([
            'voucher_id' => $v2->voucher_id,
            'product_id' => $pFacialTissue->product_id,
            'quantity' => 3,
            'unit_price' => $pFacialTissue->price, // 2500
            'sub_total' => 7500.00,
            'total' => 7500.00,
        ]);

        $v3 = Voucher::create([
            'session_id' => $sessionId,
            'payment_id' => $cashPayment->payment_id,
            'sale_date' => Carbon::create(2026, 6, 7, 13, 45, 22),
            'status' => 'VOIDED',
            'change' => 290.00, // ပေးငွေ ၂၀၀၀၊ အကြွေ ၂၉၀
            'payment_received' => 2000.00,
            'void_reason' => 'Customer-selected wrong item',
            'voided_at' => Carbon::create(2026, 6, 7, 14, 0, 0),
        ]);
        VoucherDetail::create([
            'voucher_id' => $v3->voucher_id,
            'product_id' => $pNescafe->product_id,
            'quantity' => 1,
            'unit_price' => $pNescafe->price,
            'sub_total' => 1800.00,
            'total' => 1710.00,
        ]);

        $v4 = Voucher::create([
            'session_id' => $sessionId,
            'payment_id' => $kpayPayment->payment_id,
            'sale_date' => Carbon::create(2026, 8, 6, 14, 20, 0),
            'status' => 'COMPLETED',
            'change' => 0.00,
            'payment_received' => 10200.00,
        ]);
        VoucherDetail::create([
            'voucher_id' => $v4->voucher_id,
            'product_id' => $pTissue->product_id,
            'quantity' => 2,
            'unit_price' => $pTissue->price,
            'sub_total' => 12000.00,
            'total' => 10200.00,
        ]);

        $v5 = Voucher::create([
            'session_id' => $sessionId,
            'payment_id' => $cashPayment->payment_id,
            'sale_date' => Carbon::create(2026, 6, 7, 13, 45, 22),
            'status' => 'VOIDED',
            'change' => 4000.00, // ပေးငွေ ၁၀၀၀၀၊ အကြွေ ၄၀၀၀
            'payment_received' => 10000.00,
            'void_reason' => 'Customer-selected wrong itemCustomer-selected wrong itemCustomer-selected wrong itemCustomer-selected wrong itemCustomer-selected wrong itemCustomer-selected wrong itemCustomer-selected wrong itemCustomer-selected wrong itemCustomer-selected wrong item',
            'voided_at' => Carbon::create(2026, 6, 7, 14, 10, 0),
        ]);
        VoucherDetail::create([
            'voucher_id' => $v5->voucher_id,
            'product_id' => $pCoke->product_id,
            'quantity' => 5,
            'unit_price' => $pCoke->price,
            'sub_total' => 6000.00,
            'total' => 6000.00,
        ]);
    }
}