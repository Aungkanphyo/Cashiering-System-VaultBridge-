<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\CashRegisterSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

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

        // Create cashier session when cashier logs in
        if ($user->role === 'cashier') {

            CashRegisterSession::create([
                'user_id' => $user->user_id,
                'opening_time' => Carbon::now(),
            ]);
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

    public function destroy(Request $request): JsonResponse
    {
        // Logout Laravel session
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
