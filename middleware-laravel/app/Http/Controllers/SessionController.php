<?php

namespace App\Http\Controllers;

use App\Models\CashRegisterSession;
use App\Models\Voucher;
use App\Models\VoucherDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Throwable;

class SessionController extends Controller
{
    // Get current cashier session
    public function currentSession()
    {
        try {

            $userId = Auth::user()->user_id;

            $session = CashRegisterSession::with('user')
                ->where('user_id', $userId)
                ->whereNull('closing_time')
                ->latest('session_id')
                ->first();


            if (!$session) {
                return response()->json([
                    'message' => 'No active session'
                ], 404);
            }


            $completed = Voucher::with('details')
                ->where('session_id', $session->session_id)
                ->where('status', 'completed');


            $totalSales = (clone $completed)
                ->get()
                ->sum(function ($voucher) {
                    return $voucher->details->sum('sub_total');
                });


            return response()->json([

                'session_id' => $session->session_id,

                'opening_time' => $session->opening_time,

                'closing_time' => $session->closing_time,


                // From voucher_details
                'expected_closing_cash' => $totalSales,


                'actual_closing_cash' => $session->actual_closing_cash,

                'discrepancy' => $session->discrepancy,

                'report_text' => $session->report_text,


                'cashier' => [
                    'user_id' => $session->user->user_id,
                    'name' => $session->user->user_name,
                ],



                'summary' => [

                    'total' => $totalSales,


                    'cash' => (clone $completed)
                        ->whereHas('salePayment', function ($q) {
                            $q->where('payment_name', 'cash');
                        })
                        ->get()
                        ->sum(function ($voucher) {
                            return $voucher->details->sum('sub_total');
                        }),



                    'kpay' => (clone $completed)
                        ->whereHas('salePayment', function ($q) {
                            $q->where('payment_name', 'kpay');
                        })
                        ->get()
                        ->sum(function ($voucher) {
                            return $voucher->details->sum('sub_total');
                        }),



                    'completed' => (clone $completed)->count(),



                    'voided' => Voucher::where('session_id', $session->session_id)
                        ->where('status', 'voided')
                        ->count(),

                ],

            ]);
        } catch (Throwable $e) {

            return response()->json([

                'message' => $e->getMessage(),

                'line' => $e->getLine(),

                'file' => $e->getFile(),

            ], 500);
        }
    }




    // Close cashier session
    public function closeSession(Request $request)
    {

        $request->validate([

            'actual_closing_cash' => 'required|numeric',

            'report_text' => 'nullable|string'

        ]);



        $userId = Auth::user()->user_id;



        $session = CashRegisterSession::where('user_id', $userId)

            ->whereNull('closing_time')

            ->latest('session_id')

            ->first();



        if (!$session) {

            return response()->json([

                "message" => "No active session"

            ], 404);
        }




        // Calculate expected cash from voucher_details
        $expected = VoucherDetail::whereHas('voucher', function ($q) use ($session) {

            $q->where('session_id', $session->session_id)

                ->where('status', 'completed');
        })

            ->sum('sub_total');





        $actual = $request->actual_closing_cash;



        $discrepancy = $actual - $expected;




        $session->update([

            "closing_time" => now(),

            "expected_closing_cash" => $expected,

            "actual_closing_cash" => $actual,

            "discrepancy" => $discrepancy,

            "report_text" => $request->report_text

        ]);





        // Sanctum logout

        $request->user()->tokens()->delete();




        return response()->json([

            "message" => "Session closed successfully"

        ]);
    }
}
