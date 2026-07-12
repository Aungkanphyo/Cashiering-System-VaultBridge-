<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CategoryController extends Controller
{
    // GET /api/categories
    public function index()
    {
        return response()->json(Category::orderBy('category_id')->get());
    }

    // GET /api/categories/{id}
    public function show($id)
    {
        $category = Category::findOrFail($id);

        return response()->json($category);
    }

    // POST /api/categories
    public function store(Request $request)
    {
        $data = $request->validate([
            'category_name' => 'required|string|unique:categories,category_name',
            'tax' => 'nullable|numeric|min:0',
            'discount_category' => 'nullable|numeric|min:0|max:100',
            'status' => 'nullable|in:active,inactive',
        ]);

        $data['status'] = $data['status'] ?? 'active';

        $category = Category::create($data);

        return response()->json($category, 201);
    }

    // PUT /api/categories/{id}
    public function update(Request $request, $id)
    {
        $category = Category::findOrFail($id);

        $data = $request->validate([
            'category_name' => [
                'sometimes', 'required', 'string',
                Rule::unique('categories', 'category_name')->ignore($category->category_id, 'category_id'),
            ],
            'tax' => 'sometimes|nullable|numeric|min:0',
            'discount_category' => 'sometimes|nullable|numeric|min:0|max:100',
            'status' => 'sometimes|required|in:active,inactive',
        ]);

        $category->fill($data);
        $category->save();

        return response()->json($category);
    }

    // DELETE /api/categories/{id}
    public function destroy($id)
    {
        $category = Category::findOrFail($id);
        $category->delete();

        return response()->json(['message' => 'Category deleted']);
    }
}