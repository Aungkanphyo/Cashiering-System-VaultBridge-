<?php
namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\SalePayment;
use App\Models\Voucher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AdminDashboardController extends Controller
{
    public function index(Request $request)
    {
        // Validate date filter
        $request->validate([
            'from' => 'nullable|date',
            'to'   => 'nullable|date|after_or_equal:from',
        ]);

        // If no dates are provided, default both to today's date
        $from = $request->from ?? date('Y-m-d');
        $to   = $request->to ?? date('Y-m-d');

        $vouchers = Voucher::with(['details', 'salePayment'])
            ->where('status', 'completed')
            ->whereBetween('sale_date', [$from . ' 00:00:00', $to . ' 23:59:59'])
            ->get();

        // COBOL Core integration Start
        $detailsData = $vouchers->flatMap(function ($voucher) {
            return collect($voucher->details)->map(function ($detail) {
                return [
                    'total' => (float) $detail->total
                ];
            });
        })->values()->toArray();

        Log::info('Data sent to COBOL:', $detailsData);

        try {
            // Directly sending raw data (details) to COBOL Micro-services
            $response = Http::timeout(10)->post('http://cobol-service:4000/calculate-total', [
                'details' => $detailsData
            ]);

            if($response->successful()) {
                $totalSales = $response->json()['totalSales'] ?? 0;
            } else {
                $totalSales = 0;
            }
        } catch (\Exception $e) {
            $totalSales = 0;
        }
        // COBOL Core integration End

        // Group vouchers by payment name and calculate totals
        $paymentGroups = $vouchers->groupBy('salePayment.payment_name');

        $payments = SalePayment::all()->map(function ($payment) use ($paymentGroups) {
            $paymentName = $payment->payment_name;

            // Find the total vouchers by relevant payment method
            $groupedVouchers = $paymentGroups->get($paymentName) ?: collect();

            $paymentTotal = $groupedVouchers->sum(function ($voucher) {
                return $voucher->details->sum('total');
            });

            return [
                'name'   => $paymentName,
                'amount' => (float) $paymentTotal,
            ];
        })->filter(function ($payment) {
            return $payment['amount'] > 0;
        })->values();

        // Best Seller Items (Keep this database-driven for performance and ranking)
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

        // Low Stock (Cleaned up using Eloquent Product model)
        $lowStock = Product::whereColumn('stock_quantity', '<=', 'min_stock_level')
            ->select('product_name', 'stock_quantity')
            ->get();

        return response()->json([
            'totalSales' => (float) $totalSales,
            'payments'   => $payments,
            'bestSeller' => $bestSeller,
            'lowStock'   => $lowStock,
        ]);
    }
}
