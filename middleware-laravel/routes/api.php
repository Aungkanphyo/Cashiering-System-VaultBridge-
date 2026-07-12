<?php

use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\StaffController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\PaymentMethodController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\Admin\AdminVoucherController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Sale\SaleController;
use App\Http\Controllers\SessionController;
use App\Http\Controllers\VoucherController;

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {return $request->user();});
Route::post('/logout',[AuthenticatedSessionController::class, 'destroy']);

// Cashier only access routes
Route::middleware(['auth:sanctum', 'cashier'])->group(function (){
    Route::get('/products', [SaleController::class, 'index']);
    Route::post('/vouchers', [SaleController::class, 'store']);
    Route::get('/vouchers/next-id', [SaleController::class, 'getNextVoucherId']);
});

// Admin only access routes
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::get('/admin/dashboard',[AdminDashboardController::class,'index']);
    Route::get('/staff', [StaffController::class, 'index']); // Staff List (+ Search & Filter)
    Route::post('/staff', [StaffController::class, 'store']);
    Route::put('/staff/{id}', [StaffController::class, 'update']);
    Route::get('/staff/{id}', [StaffController::class, 'show']); // View Staff Detail (Popup)
    Route::patch('/staff/{id}/toggle-status', [StaffController::class, 'toggleStatus']);

    // Voucher History API Endpoint
    Route::get('/admin/vouchers', [AdminVoucherController::class, 'index']);
});

Route::middleware(['auth:sanctum'])->group(function () {
    // Products
    Route::get('/products', [ProductController::class, 'index']);
    Route::post('/products', [ProductController::class, 'store']);
    Route::get('/products/{id}', [ProductController::class, 'show']);
    Route::put('/products/{id}', [ProductController::class, 'update']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);

    // Categories
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::get('/categories/{id}', [CategoryController::class, 'show']);
    Route::put('/categories/{id}', [CategoryController::class, 'update']);
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);

    // Payment Methods
    Route::get('/payment-methods', [PaymentMethodController::class, 'index']);
    Route::post('/payment-methods', [PaymentMethodController::class, 'store']);
    Route::get('/payment-methods/{id}', [PaymentMethodController::class, 'show']);
    Route::put('/payment-methods/{id}', [PaymentMethodController::class, 'update']);
    Route::delete('/payment-methods/{id}', [PaymentMethodController::class, 'destroy']);

    Route::get('/cash-register/session', [SessionController::class, 'currentSession']);
    Route::post('/cash-register/close',[SessionController::class, 'closeSession']);
    Route::get('/vouchers', [VoucherController::class, 'index']);
    Route::post('/vouchers/{id}/void', [VoucherController::class, 'void']);
});

require __DIR__.'/auth.php';