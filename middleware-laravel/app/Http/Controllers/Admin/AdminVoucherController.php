<?php

namespace App\Http\Controllers\Admin;

use App\Exports\VoucherExport;
use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\VoucherResource;
use App\Models\Voucher;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

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

    public function export(Request $request)
    {
        $filters = [
            'search_id'      => $request->input('search_id'),
            'payment_method' => $request->input('payment_method'),
            'status'         => $request->input('status'),
            'from_date'      => $request->input('from_date'),
            'to_date'        => $request->input('to_date'),
        ];

        $fileName = 'Voucher_History_' . now()->format('Y-m-d_His') . '.xlsx';

        return Excel::download(new VoucherExport($filters), $fileName);

    }
}
