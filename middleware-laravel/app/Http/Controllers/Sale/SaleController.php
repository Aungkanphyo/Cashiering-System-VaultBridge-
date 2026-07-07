<?php

namespace App\Http\Controllers\Sale;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SaleController extends Controller
{
    /**
     * POS Quick Click Items အတွက် Product lists ကို 
     * Category details များနှင့်တကွ ဆွဲထုတ်ပေးခြင်း။
     */
    public function index(): JsonResponse
    {
        try {
            // Models folder အောက်ရှိ သက်ဆိုင်ရာ Category relationship ပါတစ်ခါတည်းဆွဲယူခြင်း
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