<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Voucher;
use Illuminate\Http\Request;

class VoucherController extends Controller
{
    public function index(Request $request)
    {
        $query = Voucher::with(['salePayment', 'details.product']);

        // Advanced Search Filter (Sale ID, Status or Payment Method)
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('voucher_id', 'like', "%{$search}%")
                ->orWhere('status', 'like', "%{$search}%")
                ->orWhereHas('salePayment', function ($paymentQuery) use ($search) {
                    $paymentQuery->where('payment_name', 'like', "%{$search}%");
                });
            });
        }

        // Date Range Filter
        if ($request->filled('from_date')) {
            $query->whereDate('sale_date', '>=', $request->input('from_date'));
        }
        if ($request->filled('to_date')) {
            $query->whereDate('sale_date', '<=', $request->input('to_date'));
        }

        $query->latest('sale_date');

        // Using Server-side Pagination (8 per page)
        $perPage = $request->input('per_page', 8);
        $vouchers = $query->paginate($perPage);

        $vouchers->getCollection()->transform(function ($voucher) {
            $subtotal = $voucher->details->sum('sub_total');
            $finalAmount = $voucher->details->sum('total');
            $totalDiscount = $subtotal - $finalAmount;

            return [
                'id' => (string) $voucher->voucher_id,
                'dateTime' => $voucher->sale_date->format('Y-m-d H:i:s'),
                'subtotal' => (float) $subtotal,
                'totalDiscount' => (float) $totalDiscount,
                'finalAmount' => (float) $finalAmount,
                'paidAmount' => (float) $voucher->payment_received,
                'changeAmount' => (float) $voucher->change,
                'paymentMethod' => $voucher->salePayment->payment_name ?? 'Cash',
                'status' => $voucher->status,
                'voidReason' => $voucher->void_reason ?? '',
                'items' => $voucher->details->map(function ($detail) {
                    return [
                        'name' => $detail->product->product_name ?? 'Unknown Product',
                        'qty' => $detail->quantity,
                        'unitPrice' => (float) $detail->unit_price,
                        'subTotal' => (float) $detail->sub_total,
                    ];
                })
            ];
        });

        return response()->json($vouchers, 200);
    }
}
