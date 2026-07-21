<?php
namespace App\Http\Controllers;

use App\Http\Requests\StoreStaffRequest;
use App\Http\Requests\UpdateStaffRequest;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class StaffController extends Controller
{
    public function index(Request $request)
    {
        $baseQuery = User::query()->where('role', '!=', 'admin');

        $totalStaff    = (clone $baseQuery)->count();
        $activeStaff   = (clone $baseQuery)->where('status', 'Active')->count();
        $inactiveStaff = (clone $baseQuery)->where('status', 'Inactive')->count();

        $staffs = $baseQuery
            ->when($request->filled('search'), function ($query) use ($request) {
                return $query->where('username', 'like', '%' . $request->search . '%');
            })
            ->orderBy('user_id', 'desc')
            ->get();

        $staffs->transform(function ($staff) {
            $staff->join_date = $staff->join_date
                ? Carbon::parse($staff->join_date)->format('Y-m-d')
                : '-';
            return $staff;
        });

        return response()->json([
            'status'  => 'success',
            'summary' => [
                'total'    => $totalStaff,
                'active'   => $activeStaff,
                'inactive' => $inactiveStaff,
            ],
            'data'    => $staffs,
        ], 200);
    }

    // Displaying details of each staff in a popup
    public function show(int $id)
    {
        $staff = User::findOrFail($id);

        $staff->date_of_birth = $staff->date_of_birth ? Carbon::parse($staff->date_of_birth)->format('Y-m-d') : '-';
        $staff->join_date     = $staff->join_date ? Carbon::parse($staff->join_date)->format('Y-m-d') : '-';

        // Accurate calculation of employment tenure (years, months, days)
        if ($staff->join_date !== '-') {
            $joinDate = Carbon::parse($staff->join_date);
            $now      = Carbon::now();

            $diff = $joinDate->diff($now);

            $durationParts = [];
            if ($diff->y > 0) {
                $durationParts[] = $diff->y . ' ' . ($diff->y > 1 ? 'Years' : 'Year');
            }

            if ($diff->m > 0) {
                $durationParts[] = $diff->m . ' ' . ($diff->m > 1 ? 'Months' : 'Month');
            }

            if ($diff->d > 0 || empty($durationParts)) {
                $durationParts[] = $diff->d . ' ' . ($diff->d > 1 ? 'Days' : 'Day');
            }

            $staff->working_duration = implode(', ', $durationParts);
        } else {
            $staff->working_duration = "-";
        }

        // Grouping and extracting occurrences by void_reason from the database
        $voidedVouchers = $staff->vouchers()
            ->whereNotNull('void_reason')
            ->where('void_reason', '!=', '')
            ->select('void_reason', DB::raw('count(*) as total'))
            ->groupBy('void_reason', 'cash_register_sessions.user_id')
            ->get();

        // Adding the Total Errors Count
        $totalErrorsCount = $voidedVouchers->sum('total');

        $errorDetails = $voidedVouchers->map(function ($voucher) {
            return $voucher->void_reason . " (" . $voucher->total . ") times";
        })->toArray();

        $staff->total_errors = [
            'count'   => $totalErrorsCount . " times",
            'details' => $errorDetails,
        ];

        return response()->json([
            'status' => 'success',
            'data'   => $staff,
        ]);
    }

    // Toggle Status Active <-> Inactive
    public function toggleStatus(int $id)
    {
        $staff = User::findOrFail($id);

        $staff->status = ($staff->status === 'Active') ? 'Inactive' : 'Active';
        $staff->save();

        return response()->json([
            'status'         => 'success',
            'message'        => 'Staff status updated successfully.',
            'updated_status' => $staff->status,
        ]);
    }

    public function store(StoreStaffRequest $request)
    {
        $staff                = new User();
        $staff->username      = $request->username;
        $staff->password      = Hash::make($request->password);
        $staff->email         = $request->email;
        $staff->phone_number  = $request->phone_number;
        $staff->gender        = $request->gender;
        $staff->date_of_birth = $request->date_of_birth;
        $staff->role          = 'cashier';
        $staff->nrc           = $request->nrc;
        $staff->address       = $request->address;
        $staff->join_date     = $request->join_date;
        $staff->status        = $request->status;
        $staff->save();

        return response()->json([
            'status'  => 'success',
            'message' => 'New employee successfully added.',
            'data'    => $staff,
        ], 201);
    }

    public function update(UpdateStaffRequest $request, int $id)
    {
        // First, find out if there are any staff who will prepare
        $staff = User::findOrFail($id);

        // Adding new data sent from the UI
        $staff->username      = $request->username;
        $staff->email         = $request->email;
        $staff->phone_number  = $request->phone_number;
        $staff->gender        = $request->gender;
        $staff->date_of_birth = $request->date_of_birth;
        $staff->nrc           = $request->nrc;
        $staff->address       = $request->address;

        $staff->save();

        return response()->json([
            'status'  => 'success',
            'message' => 'Employee information updated successfully.',
            'data'    => $staff,
        ]);
    }
}
