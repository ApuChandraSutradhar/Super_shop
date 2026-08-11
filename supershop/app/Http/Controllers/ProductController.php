<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'category' => 'required|string',
            'price' => 'required|numeric',
            'description' => 'nullable|string',
            'image' => 'nullable|string',
        ]);

        $product = Product::create([
            'name' => $request->name,
            'category' => $request->category,
            'price' => $request->price,
            'description' => $request->description ?? '',
            'image' => $request->image ?? '',
        ]);

        return response()->json([
            'message' => 'Product Added Successfully!',
            'product' => $product
        ], 201);
    }

    public function index(Request $request)
    {
        $query = Product::query();

        if ($request->has('category') && $request->category != 'All') {
            $query->where('category', $request->category);
        }

        return response()->json($query->get(), 200);
    }
}