<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
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

        $from = $request->from;
        $to   = $request->to;

        // total sales
        $totalSales = DB::table('vouchers')
            ->where('vouchers.status', 'completed')
            ->when($from && $to, function ($query) use ($from, $to) 
                    {$query->whereBetween('vouchers.sale_date',[$from . ' 00:00:00',$to . ' 23:59:59']);})
            ->sum('vouchers.final_amount');

        // payments
        $payments = DB::table('vouchers')
            ->join('sale_payments','vouchers.payment_id','=','sale_payments.payment_id' )
            ->where('vouchers.status', 'completed')
            ->when($from && $to, function ($query) use ($from, $to) 
                    {$query->whereBetween('vouchers.sale_date',[$from . ' 00:00:00',$to . ' 23:59:59']);})
            ->select('sale_payments.payment_name',DB::raw('SUM(vouchers.final_amount) as total'))
            ->groupBy('sale_payments.payment_name')
            ->get();

        $cash = 0;
        $kpay = 0;
        $wave = 0;

        foreach ($payments as $payment) {
            switch ($payment->payment_name) 
            {
                case "Cash":
                    $cash = (float)$payment->total;
                    break;
                case "KBZ Pay":
                    $kpay = (float)$payment->total;
                    break;
                case "Wave Pay":
                    $wave = (float)$payment->total;
                    break;
            }
        }

        // best seller items

        $bestSeller = DB::table('voucher_details')
            ->join('products','voucher_details.product_id','=','products.product_id')
            ->join('vouchers','voucher_details.voucher_id','=','vouchers.voucher_id')
            ->where('vouchers.status','completed')
            ->when($from && $to, function ($query) use ($from, $to) 
                    {$query->whereBetween('vouchers.sale_date',[$from . ' 00:00:00',$to . ' 23:59:59']);})
            ->select('products.product_name',DB::raw('SUM(voucher_details.quantity) as qty'))
            ->groupBy('products.product_name')
            ->orderByDesc('qty')
            ->limit(5)
            ->get();


        // low stock
        $lowStock = DB::table('products')
            ->whereColumn('stock_quantity','<=','min_stock_level')
            ->select('product_name','stock_quantity')
            ->get();

        return response()->json([
            'cards' => [
                'sales' => (float)$totalSales,
                'cash' => $cash,
                'kpay' => $kpay,
                'wave' => $wave,
            ],
            'bestSeller' => $bestSeller,
            'lowStock' => $lowStock,
        ]);
    }
}