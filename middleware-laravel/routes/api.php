<?php

use App\Http\Controllers\StaffController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});

// Admin only access routes
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::get('/staff', [StaffController::class, 'index']); // Staff List (+ Search & Filter)
    Route::get('/staff/{id}', [StaffController::class, 'show']); // View Staff Detail (Popup)
    Route::patch('/staff/{id}/toggle-status', [StaffController::class, 'toggleStatus']);

});

require __DIR__.'/auth.php';