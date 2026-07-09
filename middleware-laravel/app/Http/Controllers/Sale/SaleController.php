<?php

namespace App\Http\Controllers\Sale;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Voucher;
use App\Models\VoucherDetail;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SaleController extends Controller
{
    public function index(): JsonResponse
    {
        try {
            $products = Product::with('category')->get();
            return response()->json($products, 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'catching data error ...',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created sale/voucher in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'session_id'       => 'required',
            'payment_id'       => 'required',
            'sale_date'        => 'required',
            'status'           => 'required',
            'change'           => 'required|numeric',
            'payment_received' => 'required|numeric',
            'items'            => 'required|array|min:1',
        ]);

        DB::beginTransaction();

        try {
            $voucher = Voucher::create([
                'session_id'       => $request->session_id,
                'payment_id'       => $request->payment_id,
                'sale_date'        => $request->sale_date,
                'status'           => $request->status,
                'change'           => $request->change,
                'payment_received' => $request->payment_received,
            ]);

            
            foreach ($request->items as $item) {
                VoucherDetail::create([
                    'voucher_id' => $voucher->voucher_id, 
                    'product_id' => $item['product_id'],
                    'quantity'   => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'sub_total'  => $item['sub_total'],
                    'total'      => $item['total'],
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Sale created successfully.',
                'voucher' => $voucher->voucher_id
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Database Error: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getNextVoucherId(): JsonResponse
    {
        try {
            $maxId = Voucher::max('voucher_id') ?? Voucher::max('id') ?? 1000;
            $nextId = $maxId + 1;

            return response()->json([
                'success' => true,
                'next_voucher_id' => $nextId
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching next voucher ID: ' . $e->getMessage()
            ], 500);
        }
    }
}