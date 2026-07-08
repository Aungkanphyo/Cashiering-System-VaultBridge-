<?php

use App\Http\Controllers\StaffController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\SessionController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Sale\SaleController;

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});


// Cashier only access routes

Route::middleware(['auth:sanctum', 'cashier'])->group(function (){
    Route::get('/products', [SaleController::class, 'index']);
});

// Admin only access routes
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::get('/staff', [StaffController::class, 'index']); // Staff List (+ Search & Filter)
    Route::post('/staff', [StaffController::class, 'store']);
    Route::put('/staff/{id}', [StaffController::class, 'update']);
    Route::get('/staff/{id}', [StaffController::class, 'show']); // View Staff Detail (Popup)
    Route::patch('/staff/{id}/toggle-status', [StaffController::class, 'toggleStatus']);

});

Route::post('/logout',[AuthenticatedSessionController::class, 'destroy']);

Route::middleware('auth:sanctum')->group(function () {

    // Get current cashier session
    Route::get('/cash-register/session', 
        [SessionController::class, 'currentSession']
    );

    // Close session and logout
    Route::post('/cash-register/close',
        [SessionController::class, 'closeSession']
    );

});

require __DIR__.'/auth.php';