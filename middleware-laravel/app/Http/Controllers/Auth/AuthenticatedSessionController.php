<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\CashRegisterSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

// Session Controller for handling user authentication and session management
use App\Models\CashRegisterSession;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;

class AuthenticatedSessionController extends Controller
{
    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): JsonResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        $user = Auth::user();

        // Check if the user is a cashier and handle cash register session
        if (strtolower($user->role) === 'cashier') {
            try {
                // Check if there is an unclosed session left for this user
                $activeSession = CashRegisterSession::where('user_id', $user->user_id)
                                                    ->whereNull('closing_time')
                                                    ->first();

                // If no active session exists, automatically create a new one using current time
                if (!$activeSession) {
                    CashRegisterSession::create([
                        'user_id'               => $user->user_id,
                        'opening_time'          => Carbon::now()->toDateTimeString(),
                        'expected_closing_cash' => 0.00,          // Default opening cash amount to 0
                    ]);
                }
            } catch (\Exception $e) {
                Log::error("Auto Open Session Error: " . $e->getMessage());
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Login successful',
            'user' => [
                'username' => $user->username,
                'email' => $user->email,
                'role' => $user->role,
            ]
        ]);
    }

    /**
     * Handle an incoming logout request.
     */
    public function destroy(Request $request): JsonResponse
    {
        $user = Auth::user();

        // Automatically close the session before logging out if the user is a cashier and has an active session
        if ($user && strtolower($user->role) === 'cashier') {
            try {
                // Find the currently running session for this cashier
                $activeSession = CashRegisterSession::where('user_id', $user->user_id)
                                                    ->whereNull('closing_time')
                                                    ->first();

                // If an active session is found, close it automatically using the current system time
                if ($activeSession) {
                    $activeSession->update([
                        'closing_time'        => Carbon::now()->toDateTimeString(), // Close with auto current time
                        'actual_closing_cash' => 0.00,          // Default to 0 for later calculation in Admin Panel
                        'discrepancy'         => 0.00,
                    ]);
                }
            } catch (\Exception $e) {
                Log::error("Auto Close Session Error: " . $e->getMessage());
            }
        }

        Auth::guard('web')->logout();
        // Clear session
        $request->session()->invalidate();
        // Create new CSRF token
        $request->session()->regenerateToken();

        return response()->json([
            "status" => "success",
            "message" => "Logged out successfully"
        ]);
    }
}