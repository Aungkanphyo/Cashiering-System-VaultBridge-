<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Voucher;
use Illuminate\Http\Request;
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

            $vouchers = Voucher::with(['salePayment','details'])
                        ->latest('voucher_id')
                        ->paginate($perPage);

            $data = $vouchers->through(function ($voucher) {
                $subTotal = $voucher->details->sum('sub_total');
                $discount = $voucher->details->sum('total_discount');
                $grandTotal = $voucher->details->sum('total');

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
            ],500);
        }
    }

    /**
     * Void Voucher
     */
    public function void(Request $request,$id)
    {
        $request->validate(['void_reason'=>'required|string']);

        DB::beginTransaction();

        try{
            $voucher = Voucher::with('details.product')->findOrFail($id);

            if($voucher->status === 'voided'){
                return response()->json([
                    'message'=>'Voucher already voided'
                ],400);
            }

            foreach($voucher->details as $detail){
                $product = $detail->product;
                $product->increment('stock_quantity',$detail->quantity);
            }

            $voucher->update([
                'status'=>'voided',
                'void_reason'=>$request->void_reason,
                'voided_at'=>now(),
            ]);
            DB::commit();
            return response()->json(['message'=>'Voucher voided successfully']);
        }catch(Throwable $e){
            DB::rollBack();
            return response()->json([
                'message'=>$e->getMessage(),
                'line'=>$e->getLine(),
            ],500);
        }
    }
}