<?php

namespace Database\Seeders;

use App\Models\CashRegisterSession;
use App\Models\Product;
use App\Models\Voucher;
use App\Models\VoucherDetail;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class SalesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = Product::all();
        if ($products->isEmpty()) {
            return;
        }

        // Cashiers IDs
        $cashiers = [2, 3]; // cashier1 (user_id=2) and cashier2 (user_id=3)
        
        $voidReasons = [
            "Customer Wants Less Qty",
            "Wrong Item Selected",
            "Cashier Error",
            "Insufficient Funds",
            "Payment Method Failed",
            "Test Transaction",
        ];

        // Loop over the last 20 days up to today
        for ($i = 20; $i >= 0; $i--) {
            $targetDate = Carbon::now()->subDays($i);
            $dateString = $targetDate->format('Y-m-d');

            // Select random cashier for the day
            $cashierId = $cashiers[array_rand($cashiers)];
            
            // Set session times (Open at 8:30 AM, Close at 6:30 PM)
            $openingTime = Carbon::parse($dateString . ' 08:30:00');
            $closingTime = Carbon::parse($dateString . ' 18:30:00');

            // Create Cash Register Session
            $session = CashRegisterSession::create([
                'user_id' => $cashierId,
                'opening_time' => $openingTime,
                'closing_time' => $closingTime,
                'expected_closing_cash' => 0,
                'actual_closing_cash' => 0,
                'discrepancy' => 0,
                'report_text' => 'Pending closing process...',
            ]);

            $sessionCompletedTotal = 0;
            $vouchersCount = rand(8, 15); // Daily total transaction count

            for ($v = 1; $v <= $vouchersCount; $v++) {
                // Generate a sale time during the opening hours
                $saleDate = $openingTime->copy()->addMinutes(rand(10, 580));

                // 10% chance of getting a voided voucher
                $isVoided = (rand(1, 100) <= 10);
                $status = $isVoided ? 'voided' : 'completed';

                $voucher = Voucher::create([
                    'session_id' => $session->session_id,
                    'payment_id' => 1, // Cash Only
                    'sale_date' => $saleDate,
                    'status' => $status,
                    'change' => 0,
                    'payment_received' => 0,
                    'void_reason' => $isVoided ? $voidReasons[array_rand($voidReasons)] : null,
                    'voided_at' => $isVoided ? $saleDate->copy()->addMinutes(rand(2, 10)) : null,
                ]);

                // Create 1 to 4 items details for each voucher
                $itemsCount = rand(1, 4);
                $selectedProducts = $products->random($itemsCount);
                $voucherTotal = 0;

                foreach ($selectedProducts as $product) {
                    $qty = rand(1, 3);
                    // Check if the product has a discounted price, otherwise use standard sale_price
                    $unitPrice = $product->discount_price > 0 ? $product->discount_price : $product->sale_price;
                    $subTotal = $unitPrice * $qty;
                    $detailTotal = $subTotal;

                    VoucherDetail::create([
                        'voucher_id' => $voucher->voucher_id,
                        'product_id' => $product->product_id,
                        'quantity' => $qty,
                        'sub_total' => $subTotal,
                        'unit_price' => $unitPrice,
                        'total' => $detailTotal,
                    ]);

                    $voucherTotal += $detailTotal;

                    // Deduct inventory stock if transaction is completed
                    if ($status === 'completed') {
                        $product->stock_quantity = max(0, $product->stock_quantity - $qty);
                        $product->save();
                    }
                }

                // Calculate realistic cash payment from customer
                if ($voucherTotal <= 1000) {
                    $paymentReceived = 1000;
                } elseif ($voucherTotal <= 5000) {
                    $paymentReceived = ceil($voucherTotal / 1000) * 1000;
                    if (rand(0, 1) === 1) { $paymentReceived = 5000; }
                } elseif ($voucherTotal <= 10000) {
                    $paymentReceived = ceil($voucherTotal / 5000) * 5000;
                    if (rand(0, 1) === 1) { $paymentReceived = 10000; }
                } else {
                    $paymentReceived = ceil($voucherTotal / 10000) * 10000;
                    if (rand(0, 1) === 1 && $paymentReceived < 20000) {
                        $paymentReceived = 20000;
                    }
                }

                // Backup check in case payment calculations fail to cover totals
                if ($paymentReceived < $voucherTotal) {
                    $paymentReceived = ceil($voucherTotal / 5000) * 5000;
                }

                $change = $paymentReceived - $voucherTotal;

                // Update Voucher Money
                $voucher->update([
                    'payment_received' => $paymentReceived,
                    'change' => $change,
                ]);

                // Update session total only for successfully completed sales
                if ($status === 'completed') {
                    $sessionCompletedTotal += $voucherTotal;
                }
            }

            // 15% chance of cashier cash discrepancy (လွဲချော်မှု)
            $discrepancy = 0;
            if (rand(1, 100) <= 15) {
                $discrepancy = collect([-1000, -500, 500, 1000, -1500])->random();
            }

            $actualClosingCash = $sessionCompletedTotal + $discrepancy;
            $reportText = $discrepancy == 0 ? "Cash balanced" : ($discrepancy > 0 ? "Extra cash" : "Cash shortage");

            // Save actual calculated cash data back to session
            $session->update([
                'expected_closing_cash' => $sessionCompletedTotal,
                'actual_closing_cash' => $actualClosingCash,
                'discrepancy' => $discrepancy,
                'report_text' => $reportText,
            ]);
        }
    }
}