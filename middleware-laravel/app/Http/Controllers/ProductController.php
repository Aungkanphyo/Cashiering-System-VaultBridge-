<?php

namespace App\Http\Controllers;

use App\Events\ProductSaved;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProductController extends Controller
{
    // GET /api/products
    public function index()
    {
        return response()->json(Product::orderBy('product_id')->get());
    }

    // GET /api/products/{id}
    public function show($id)
    {
        $product = Product::findOrFail($id);

        return response()->json($product);
    }

    // POST /api/products
    public function store(Request $request)
    {
        $data = $request->validate([
            'barcode' => 'required|digits_between:1,15|numeric|unique:products,barcode',
            'product_name' => 'required|string|unique:products,product_name',
            'price' => 'required|numeric|min:0',
            'category_id' => 'required|integer|exists:categories,category_id',
            'stock_quantity' => 'required|integer|min:0',
            'min_stock_level' => 'required|integer|min:0',
            'discount_rate' => 'nullable|numeric|min:0|max:100',
            'status' => 'nullable|in:active,inactive',
        ]);

        // Category carries the tax rate and the minimum (floor) discount that
        // every product under it must respect.
        $category = Category::findOrFail($data['category_id']);
        $categoryTax = (float) ($category->tax ?? 0);
        $categoryDiscountFloor = (float) ($category->discount_category ?? 0);

        // If no discount was supplied, fall back to the category's default discount.
        $discountRate = array_key_exists('discount_rate', $data) && $data['discount_rate'] !== null
            ? (float) $data['discount_rate']
            : $categoryDiscountFloor;

        // The discount can never go below the category's own discount, but it can
        // be raised all the way up to 100%.
        if ($discountRate < $categoryDiscountFloor) {
            return response()->json([
                'message' => "Discount rate cannot be lower than the category's discount ({$categoryDiscountFloor}%).",
                'errors' => [
                    'discount_rate' => ["Discount rate cannot be lower than {$categoryDiscountFloor}% for this category."],
                ],
            ], 422);
        }

        $data['discount_rate'] = $discountRate;
        $data['status'] = $data['status'] ?? 'active';

        // sale_price = price + tax (category tax applied on top of the base price)
        $data['sale_price'] = round($data['price'] + ($data['price'] * $categoryTax / 100), 2);
        // discount_price = the amount of money taken off, computed from the sale price
        $data['discount_price'] = round($data['sale_price'] * $discountRate / 100, 2);

        $product = Product::create($data);

        // real-time event trigger
        event(new ProductSaved($product));

        return response()->json($product, 201);
    }

    // PUT /api/products/{id}
    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $data = $request->validate([
            'barcode' => [
                'sometimes',
                'required',
                'numeric',
                'digits_between:1,15',
                Rule::unique('products', 'barcode')
                    ->ignore($product->product_id, 'product_id'),
            ],
            'product_name' => [
                'sometimes',
                'required',
                'string',
                Rule::unique('products', 'product_name')->ignore($product->product_id, 'product_id'),
            ],
            'price' => 'sometimes|required|numeric|min:0',
            'category_id' => 'sometimes|required|integer|exists:categories,category_id',
            'stock_quantity' => 'sometimes|required|integer|min:0',
            'min_stock_level' => 'sometimes|required|integer|min:0',
            'discount_rate' => 'sometimes|nullable|numeric|min:0|max:100',
            'status' => 'sometimes|required|in:active,inactive',
        ]);

        // Resolve the category that will be in effect after this update (either the
        // newly submitted one, or the product's current one) so tax/discount floor
        // always reflect the correct category.
        $categoryId = $data['category_id'] ?? $product->category_id;
        $category = Category::findOrFail($categoryId);
        $categoryTax = (float) ($category->tax ?? 0);
        $categoryDiscountFloor = (float) ($category->discount_category ?? 0);

        if (array_key_exists('discount_rate', $data)) {
            $discountRate = $data['discount_rate'] ?? $categoryDiscountFloor;

            if ($discountRate < $categoryDiscountFloor) {
                return response()->json([
                    'message' => "Discount rate cannot be lower than the category's discount ({$categoryDiscountFloor}%).",
                    'errors' => [
                        'discount_rate' => ["Discount rate cannot be lower than {$categoryDiscountFloor}% for this category."],
                    ],
                ], 422);
            }

            $data['discount_rate'] = $discountRate;
        }

        $product->fill($data);

        // If the category changed (or wasn't touched) and the product's current
        // discount now sits below the (possibly new) category floor, bump it up.
        if ((float) $product->discount_rate < $categoryDiscountFloor) {
            $product->discount_rate = $categoryDiscountFloor;
        }

        // Recompute derived pricing fields whenever price, category or discount changes
        $price = (float) $product->price;
        $rate = (float) ($product->discount_rate ?? 0);
        // sale_price = price + tax (category tax applied on top of the base price)
        $product->sale_price = round($price + ($price * $categoryTax / 100), 2);
        // discount_price = the amount of money taken off, computed from the sale price
        $product->discount_price = round($product->sale_price * $rate / 100, 2);

        $product->save();

        // real-time event trigger
        event(new ProductSaved($product));

        return response()->json($product);
    }

    // DELETE /api/products/{id}
    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        $product->delete();

        return response()->json(['message' => 'Product deleted']);
    }
}