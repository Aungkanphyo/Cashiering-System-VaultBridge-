<?php

namespace App\Http\Controllers;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StaffController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query()->where('role', '!=', 'admin');

        // Search by name
        if ($request->filled('search')) {
            $query->where('username', 'like', '%' . $request->search . '%');
        }

        // Filter by Status (Active / Inactive)
        if ($request->filled('status') && $request->status !== 'All') {
            $query->where('status', $request->status);
        }

        $staffs = $query->orderBy('user_id', 'desc')->get();

        return response()->json([
            'status' => 'success',
            'data' => $staffs
        ]);
    }

    // Displaying details of each staff in a popup
    public function show(int $id)
    {
        $staff = User::findOrFail($id);

        // Calculate working time
        $joinDate = Carbon::parse($staff->join_date);
        $workingDays = $joinDate->diffInDays(Carbon::now());

        // Preparing the required format for UI Popup
        $staff->working_year_text = "Working year : " . $workingDays . " days";

        // Grouping and extracting occurrences by void_reason from the database
        $voidedVouchers = $staff->vouchers()
            ->whereNotNull('void_reason')
            ->where('void_reason', '!=', '')
            ->select('void_reason', DB::raw('count(*) as total'))
            ->groupBy('void_reason')
            ->get();

        // Adding the Total Errors Count
        $totalErrorsCount = $voidedVouchers->sum('total');

        $errorDetails = $voidedVouchers->map(function ($voucher) {
            return "- " . $voucher->void_reason . " (" . $voucher->total . ") times";
        })->toArray();

        $staff->total_errors = [
            'count' => $totalErrorsCount . " times",
            'details' => $errorDetails
        ];

        return response()->json([
            'status' => 'success',
            'data' => $staff
        ]);
    }

    // Toggle Status Active <-> Inactive
    public function toggleStatus(int $id)
    {
        $staff = User::findOrFail($id);

        $staff->status = ($staff->status === 'Active') ? 'Inactive' : 'Active';
        $staff->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Staff status updated successfully.',
            'updated_status' => $staff->status
        ]);
    }
}
