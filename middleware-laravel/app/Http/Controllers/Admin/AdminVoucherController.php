<?php

namespace App\Http\Controllers\Admin;

use App\Exports\VoucherExport;
use App\Http\Controllers\Controller;
use App\Models\Voucher;
use Illuminate\Http\Request;
use Carbon\Carbon; //  Date Handling 
use Maatwebsite\Excel\Facades\Excel;

class AdminVoucherController extends Controller
{
    public function index(Request $request)
    {
        // 4 Table Relationships: Voucher, SalePayment, CashRegisterSession, User
        $query = Voucher::with(['salePayment', 'details.product', 'cashRegisterSession.user']);

        // id filter
        if ($request->filled('search_id')) {
            $searchId = $request->input('search_id');
            $query->where('voucher_id', 'like', "%{$searchId}%");
        }

        // Payment method filter
        if ($request->filled('payment_method') && $request->input('payment_method') !== 'ALL') {
            $paymentMethod = $request->input('payment_method');
            
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

        // Date Range Filter 
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

        // data transformation for API response
        $vouchers->getCollection()->transform(function ($voucher) {
            return [
                'id'               => $voucher->voucher_id,
                'session_id'       => $voucher->session_id,
                'payment_id'       => $voucher->payment_id,
                
                // date time formatting using Carbon
                'dateTime'         => $voucher->sale_date ? Carbon::parse($voucher->sale_date)->format('Y-m-d H:i:s') : null,
                
                'status'           => $voucher->status,
                'changeAmount'     => $voucher->change,
                'payment_received' => $voucher->payment_received,
                'void_reason'      => $voucher->void_reason,
                'voided_at'        => $voucher->voided_at ? Carbon::parse($voucher->voided_at)->format('Y-m-d H:i:s') : null,

                // Cashier Name
                'cashierName'      => $voucher->cashRegisterSession && $voucher->cashRegisterSession->user 
                                        ? $voucher->cashRegisterSession->user->username 
                                        : 'N/A',

                // Payment Method Name
                'paymentMethod'    => $voucher->salePayment ? $voucher->salePayment->payment_name : 'N/A',
                
                // Items List (Voucher Details)
                'items'            => $voucher->details ? $voucher->details->map(function ($detail) {
                    return [
                        'name'       => $detail->product ? $detail->product->product_name : 'N/A',
                        'qty'        => $detail->quantity,
                        'unitPrice'  => $detail->unit_price,
                        'subTotal'   => $detail->sub_total,
                        'total'      => $detail->total,
                    ];
                }) : [],
            ];
        });

        return response()->json($vouchers);
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