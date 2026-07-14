<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\VoucherResource;
use App\Models\Voucher;
use Illuminate\Http\Request;

class AdminVoucherController extends Controller
{
    public function index(Request $request)
    {
        // query builder 
        $query = Voucher::with(['salePayment', 'details.product']);

        // id filter
        if ($request->filled('search_id')) {
            $searchId = $request->input('search_id');
            $query->where('voucher_id', 'like', "%{$searchId}%");
        }

        // Payment method filter
        if ($request->filled('payment_method') && $request->input('payment_method') !== 'ALL') {
            $paymentMethod = $request->input('payment_method');

            // checking payment name in salePayment Relation 
            $query->whereHas('salePayment', function ($paymentQuery) use ($paymentMethod) {
                $paymentQuery->where('payment_name', 'like', "%{$paymentMethod}%");
            });
        }

        // Status Select Box Filter (COMPLETED / VOIDED)
        if ($request->filled('status') && $request->input('status') !== 'ALL') {
            $status = strtolower($request->input('status'));

            if ($status === 'voided') {
                $query->where('status', 'VOIDED');
            } else if ($status === 'completed') {
                $query->where('status', 'COMPLETED')->whereNull('void_reason');
            }
        }

        $request->validate([
            'from_date' => 'nullable|date|before_or_equal:today',
            'to_date'   => 'nullable|date|after_or_equal:from_date|before_or_equal:today',
        ]);

        //  Date Range Filter 
        if ($request->filled('from_date')) {
            $query->whereDate('sale_date', '>=', $request->input('from_date'));
        }
        if ($request->filled('to_date')) {
            $query->whereDate('sale_date', '<=', $request->input('to_date'));
        }

        // latest Voucher 
        $query->latest('sale_date');

        // Server-side Pagination 
        $perPage = $request->input('per_page', 8);
        $vouchers = $query->paginate($perPage);

        return VoucherResource::collection($vouchers);
    }
}
