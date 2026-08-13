<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function store(Request $request)
    {
        try {
            $product = Product::create([
                'name'        => $request->name,
                'category'    => $request->category,
                'price'       => $request->price,
                'discount'    => $request->discount ?? 0,
                'stock'       => $request->stock ?? 0,
                'description' => $request->description ?? '',
                'image'       => $request->image ?? '',
            ]);

            return response()->json([
                'status'  => 'success',
                'message' => 'Product Added Successfully!',
                'product' => $product
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function index(Request $request)
    {
        $query = Product::query();

        if ($request->has('category') && $request->category != 'All') {
            $query->where('category', $request->category);
        }

        return response()->json($query->get(), 200);
    }
// স্টক ১ কমানোর মেথড
public function decrementStock($id)
{
    $product = Product::find($id);

    if (!$product) {
        return response()->json(['message' => 'Product not found'], 404);
    }

    if ($product->stock > 0) {
        $product->decrement('stock', 1); // ১ টি করে স্টক কমাবে
        return response()->json([
            'status' => 'success',
            'message' => 'Stock updated successfully',
            'stock' => $product->stock
        ], 200);
    }

    return response()->json(['message' => 'Out of stock'], 400);
}
}