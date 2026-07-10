<?php

use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\SessionController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
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

Route::get('/admin/dashboard',[AdminDashboardController::class,'index']);

require __DIR__.'/auth.php';