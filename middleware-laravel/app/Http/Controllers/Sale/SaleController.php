<?php

namespace App\Http\Controllers\Sale;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;

class SaleController extends Controller
{
    public function index(): JsonResponse
    {
        try {
            $products = Product::with('category')->get();
            return response()->json($products, 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'catching data error ...',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}