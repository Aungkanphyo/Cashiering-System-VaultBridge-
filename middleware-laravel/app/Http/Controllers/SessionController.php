<?php

namespace App\Http\Controllers;

use App\Models\CashRegisterSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class SessionController extends Controller
{
    // Get current cashier session
    public function currentSession()
    {
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


        // $total = Voucher::where('session_id', $session->session_id)->where('status', 'completed')->sum('final_amount');
        // $cash = Voucher::where('session_id', $session->session_id)->where('status', 'completed')
        //         ->whereHas('payment', function ($query) {$query->where('payment_type', 'cash');})
        //         ->sum('final_amount');

        // $kpay = Voucher::where('session_id', $session->session_id)->where('status', 'completed')->
        //         whereHas('payment', function ($query) {$query->where('payment_type', 'kpay');})
        //         ->sum('final_amount');

        // $voided = Voucher::where('session_id', $session->session_id)->where('status', 'voided')->count();

        return response()->json([
            "session_id" => $session->session_id,
            "opening_time" => $session->opening_time,
            "expected_closing_cash" => $session->expected_closing_cash,
            // "summary" =>["total" => $total,
            //              "cash" => $cash,
            //              "kpay" => $kpay,
            //              "voided" => $voided,
            //             ]
        ]);
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


        $expected = $session->expected_closing_cash;
        $actual = $request->actual_closing_cash;
        $discrepancy = $actual - $expected;


        $session->update([
            "closing_time" => now(),
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
