<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Voucher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Throwable;

class VoucherController extends Controller
{
    /**
     * Voucher History
     */
    public function index(Request $request)
    {
        try {

            $perPage = $request->get('per_page', 10);

            // Get current open session
            $session = DB::table('cash_register_sessions')
                ->where('user_id', Auth::user()->user_id)
                ->whereNull('closing_time')
                ->first();

            if (!$session) {
                return response()->json([
                    'message' => 'No active cashier session found'
                ], 404);
            }

            // Get only vouchers from current session
            $vouchers = Voucher::with(['salePayment', 'details'])
                ->where('session_id', $session->session_id)
                ->latest('voucher_id')
                ->paginate($perPage);


            $data = $vouchers->through(function ($voucher) {
                $subTotal = $voucher->details->sum('sub_total');
                $grandTotal = $voucher->details->sum('total');
                $discount = $subTotal - $grandTotal;

                return [
                    'voucher_id' => $voucher->voucher_id,
                    'sale_date' => $voucher->sale_date,
                    'total' => $subTotal,
                    'discount' => $discount,
                    'grand_total' => $grandTotal,
                    'payment' => $voucher->salePayment?->payment_name,
                    'status' => $voucher->status,
                    'void_reason' => $voucher->void_reason,
                ];
            });

            return response()->json($data);
        } catch (Throwable $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'line' => $e->getLine(),
            ], 500);
        }
    }

    /**
     * Void Voucher
     */
    public function void(Request $request, $id)
    {
        $request->validate(['void_reason' => 'required|string']);

        DB::beginTransaction();

        try {
            $voucher = Voucher::with('details.product')->findOrFail($id);

            if ($voucher->status === 'voided') {
                return response()->json([
                    'message' => 'Voucher already voided'
                ], 400);
            }

            foreach ($voucher->details as $detail) {
                $product = $detail->product;
                $product->increment('stock_quantity', $detail->quantity);
            }

            $voucher->update([
                'status' => 'voided',
                'void_reason' => $request->void_reason,
                'voided_at' => now(),
            ]);
            DB::commit();
            return response()->json(['message' => 'Voucher voided successfully']);
        } catch (Throwable $e) {
            DB::rollBack();
            return response()->json([
                'message' => $e->getMessage(),
                'line' => $e->getLine(),
            ], 500);
        }
    }
}
