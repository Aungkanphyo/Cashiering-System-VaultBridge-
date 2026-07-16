<?php

namespace App\Http\Controllers;

use App\Models\CashRegisterSession;
use App\Models\SalePayment;
use App\Models\Voucher;
use App\Models\VoucherDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Throwable;

class SessionController extends Controller
{

    public function getCashSessions(Request $request)
    {
        try {
            // Users Table and CashRegisterSessions Table a relationship create loh, CashRegisterSession model a with('user') loh relationship call loh, user_id a join loh data fetch loh
            $query = CashRegisterSession::with('user');

            // 1. username search filter
            if ($request->filled('search')) {
                $searchTerm = $request->input('search');
                $query->whereHas('user', function ($q) use ($searchTerm) {
                    $q->where('username', 'LIKE', '%' . $searchTerm . '%');
                });
            }

            // 2. From Date Filter

            $request->validate([
                'from_date' => 'nullable|date|before_or_equal:today',
                'to_date'   => 'nullable|date|after_or_equal:from_date|before_or_equal:today',
            ]);
            
            if ($request->filled('from_date')) {
                $query->whereDate('opening_time', '>=', $request->input('from_date'));
            }

            // 3. To Date Filter
            if ($request->filled('to_date')) {
                $query->whereDate('opening_time', '<=', $request->input('to_date'));
            }

            // 4. Pagination
            $perPage = $request->get('per_page', 8);
            $sessions = $query->orderBy('session_id', 'desc')->paginate($perPage);

            return response()->json($sessions);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Something went wrong while fetching sessions',
                'error' => $e->getMessage() // Error အဖြေအမှန်ကို Front-end Console တွင် စစ်ဆေးနိုင်ရန်
            ], 500);
        }
    }
    /**
     * Get current cashier session
     */
    public function currentSession()
    {
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
            ->where('status', 'COMPLETED');

        $totalSales = (clone $completed)
            ->get()
            ->sum(function ($voucher) {
                return $voucher->details->sum('total');
            });

        $paymentSummary = [];
        $payments = SalePayment::get();

        foreach ($payments as $payment) {
            $paymentSummary[strtolower($payment->payment_name)] =
                (clone $completed)
                ->whereHas('salePayment', function ($q) use ($payment) {
                    $q->where('payment_name', $payment->payment_name);
                })
                ->get()
                ->sum(function ($voucher) {
                    return $voucher->details->sum('total');
                });
        }

        return response()->json([
            'session_id' => $session->session_id,
            'opening_time' => $session->opening_time,
            'closing_time' => $session->closing_time,
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
                'payments' => $paymentSummary,
                'completed' => (clone $completed)->count(),
                'voided' => Voucher::where('session_id', $session->session_id)
                    ->where('status', 'VOIDED')
                    ->count(),
            ],
        ]);
    }

    /**
     * Close cashier session
     */
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

        $expected = VoucherDetail::whereHas('voucher', function ($q) use ($session) {
            $q->where('session_id', $session->session_id)
                ->where('status', 'COMPLETED');
        })->sum('total');

        $actual = $request->actual_closing_cash;
        $discrepancy = $actual - $expected;

        $session->update([
            "closing_time" => now(),
            "expected_closing_cash" => $expected,
            "actual_closing_cash" => $actual,
            "discrepancy" => $discrepancy,
            "report_text" => $request->report_text
        ]);

        $request->user()->tokens()->delete();

        return response()->json([
            "message" => "Session closed successfully"
        ]);
    }
}
