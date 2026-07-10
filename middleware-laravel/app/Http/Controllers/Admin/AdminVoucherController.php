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

        return VoucherResource::collection($vouchers);
    }
}
