<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CashRegisterSession;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class SessionController extends Controller
{
    public function getCashSessions(Request $request)
    {
        try {
            // 🌟 user table ထဲက field အားလုံးကို အန္တရာယ်ကင်းကင်းဖြင့် အကုန်ဆွဲထုတ်ခြင်း
            $query = CashRegisterSession::with('user');

            // ၁။ Cashier/Staff Name ရှာဖွေခြင်း Filter
            if ($request->filled('search')) {
                $search = $request->input('search');
                $query->whereHas('user', function ($q) use ($search) {
                    // name, user_name, username ကြိုက်တာဖြစ်ဖြစ် အကုန်မိအောင် စစ်ဆေးပေးထားခြင်း
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('username', 'like', "%{$search}%");
                });
            }

            // ၂။ Date Filters
            if ($request->filled('from_date')) {
                $fromDate = Carbon::parse($request->input('from_date'))->startOfDay();
                $query->where('opening_time', '>=', $fromDate);
            }
            
            if ($request->filled('to_date')) {
                $toDate = Carbon::parse($request->input('to_date'))->endOfDay();
                $query->where('opening_time', '<=', $toDate);
            }

            // ၃။ Sorting Logic
            $query->orderByRaw('closing_time IS NOT NULL ASC')
                  ->orderBy('opening_time', 'DESC');

            // ၄။ Pagination
            $perPage = $request->input('per_page', 8);
            $sessions = $query->paginate($perPage);

            return response()->json($sessions);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}