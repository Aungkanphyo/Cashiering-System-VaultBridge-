<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Sale\SaleController; // သို့မဟုတ် ProductController

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});


// ⚠️ Route နာမည်က 'products' အတိအကျ ဖြစ်ရပါမယ် (product မဟုတ်ပါ)
Route::get('/products', [SaleController::class, 'index']);

require __DIR__.'/auth.php';