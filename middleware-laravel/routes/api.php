<?php

use App\Http\Controllers\StaffController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\SessionController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Sale\SaleController;
use App\Http\Controllers\VoucherController;

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {return $request->user();});
Route::post('/logout',[AuthenticatedSessionController::class, 'destroy']);

// Cashier only access routes
Route::middleware(['auth:sanctum', 'cashier'])->group(function (){
    Route::get('/products', [SaleController::class, 'index']);
    Route::post('/vouchers', [SaleController::class, 'store']);
    
});

// Admin only access routes
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::get('/staff', [StaffController::class, 'index']); // Staff List (+ Search & Filter)
    Route::post('/staff', [StaffController::class, 'store']);
    Route::put('/staff/{id}', [StaffController::class, 'update']);
    Route::get('/staff/{id}', [StaffController::class, 'show']); // View Staff Detail (Popup)
    Route::patch('/staff/{id}/toggle-status', [StaffController::class, 'toggleStatus']);

});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/cash-register/session', [SessionController::class, 'currentSession']);
    Route::post('/cash-register/close',[SessionController::class, 'closeSession']);
    Route::get('/vouchers', [VoucherController::class, 'index']);
    Route::post('/vouchers/{id}/void', [VoucherController::class, 'void']);
});

require __DIR__.'/auth.php';