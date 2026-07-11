<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Voucher; 
use App\Models\Product; 
use Illuminate\Support\Facades\DB;

class AdminDashboardController extends Controller
{
    public function index(Request $request)
    {
        // Validate date filter
        $request->validate([
            'from' => 'nullable|date',
            'to'   => 'nullable|date|after_or_equal:from'
        ]);

        // If no dates are provided, default both to today's date
        $from = $request->from ?? date('Y-m-d');
        $to   = $request->to ?? date('Y-m-d');

        $vouchers = Voucher::with(['details', 'salePayment'])
            ->where('status', 'completed')
            ->whereBetween('sale_date', [$from . ' 00:00:00', $to . ' 23:59:59'])
            ->get();

        // 1. Calculate Total Sales
        $totalSales = $vouchers->sum(function ($voucher) {
            return $voucher->details->sum('total');
        });

        // 2. Payments Breakdown using Collection grouping
        $cash = 0;
        $kpay = 0;

        // Group vouchers by payment name and calculate totals
        $paymentGroups = $vouchers->groupBy('salePayment.payment_name');

        foreach ($paymentGroups as $paymentName => $groupedVouchers) {
            $paymentTotal = $groupedVouchers->sum(function ($voucher) {
                return $voucher->details->sum('total');
            });

            switch ($paymentName) 
            {
                case "Cash":
                    $cash = (float)$paymentTotal;
                    break;
                case "KPay":
                    $kpay = (float)$paymentTotal;
                    break;
            }
        }

        // 3. Best Seller Items (Keep this database-driven for performance and ranking)
        $bestSeller = DB::table('voucher_details')
            ->join('products', 'voucher_details.product_id', '=', 'products.product_id')
            ->join('vouchers', 'voucher_details.voucher_id', '=', 'vouchers.voucher_id')
            ->where('vouchers.status', 'completed')
            ->whereBetween('vouchers.sale_date', [$from . ' 00:00:00', $to . ' 23:59:59'])
            ->select('products.product_name', DB::raw('SUM(voucher_details.quantity) as qty'))
            ->groupBy('products.product_name')
            ->orderByDesc('qty')
            ->limit(5)
            ->get();

        // 4. Low Stock (Cleaned up using Eloquent Product model)
        $lowStock = Product::whereColumn('stock_quantity', '<=', 'min_stock_level')
            ->select('product_name', 'stock_quantity')
            ->get();

        return response()->json([
            'cards' => [
                'sales' => (float)$totalSales,
                'cash' => $cash,
                'kpay' => $kpay,
            ],
            'bestSeller' => $bestSeller,
            'lowStock' => $lowStock,
        ]);
    }
}