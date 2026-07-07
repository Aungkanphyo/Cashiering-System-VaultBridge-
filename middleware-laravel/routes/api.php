<?php

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

require __DIR__.'/auth.php';