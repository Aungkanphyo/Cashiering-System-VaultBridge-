<?php

use App\Http\Controllers\StaffController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Sale\SaleController; 
Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});



Route::get('/products', [SaleController::class, 'index']);

// Route::middleware(['auth:sanctum'])->group(function () {
//     Route::get('/products', [SaleController::class, 'index']);
// });
// Admin only access routes
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::get('/staff', [StaffController::class, 'index']); // Staff List (+ Search & Filter)
    Route::post('/staff', [StaffController::class, 'store']);
    Route::put('/staff/{id}', [StaffController::class, 'update']);
    Route::get('/staff/{id}', [StaffController::class, 'show']); // View Staff Detail (Popup)
    Route::patch('/staff/{id}/toggle-status', [StaffController::class, 'toggleStatus']);

});

require __DIR__.'/auth.php';