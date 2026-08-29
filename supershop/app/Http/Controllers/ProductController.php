<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function store(Request $request)
    {
        try {
            $request->validate([
                'name'     => 'required|string',
                'category' => 'required|string',
                'price'    => 'required|numeric',
                'stock'    => 'required|integer',
                'image'    => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048', // ২MB সর্বোচ্চ
            ]);

            $imageUrl = '';

            if ($request->hasFile('image')) {
                $image = $request->file('image');
                $imageName = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
                
                // public/uploads/products
                $image->move(public_path('uploads/products'), $imageName);
                
                $imageUrl = asset('uploads/products/' . $imageName);
            } elseif ($request->image_url) {
                $imageUrl = $request->image_url;
            }

            $product = Product::create([
                'name'        => $request->name,
                'category'    => $request->category,
                'price'       => $request->price,
                'discount'    => $request->discount ?? 0,
                'stock'       => $request->stock ?? 0,
                'description' => $request->description ?? '',
                'image'       => $imageUrl,
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
        $request->validate([
            'category' => ['nullable', 'string', 'max:100'],
            'search' => ['nullable', 'string', 'max:100'],
            'paginate' => ['nullable', 'boolean'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:48'],
        ]);

        // Expose only aggregate review data to shoppers. Individual feedback
        // remains available to the admin feedback screen.
        $query = Product::query()
            ->withAvg('feedbacks as rating', 'rating_stars')
            ->withCount('feedbacks as review');

        if ($request->filled('category') && $request->category !== 'All') {
            $query->where('category', $request->category);
        }

        if ($request->filled('search')) {
            $search = trim($request->string('search')->value());
            $query->where('name', 'like', "%{$search}%");
        }

        $query->latest('id');

        if ($request->boolean('paginate')) {
            return response()->json(
                $query->paginate($request->integer('per_page', 12))->withQueryString(),
                200
            );
        }

        return response()->json($query->get(), 200);
    }

    public function decrementStock($id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        if ($product->stock > 0) {
            $product->decrement('stock', 1);
            return response()->json([
                'status'  => 'success',
                'message' => 'Stock updated successfully',
                'stock'   => $product->stock
            ], 200);
        }

        return response()->json(['message' => 'Out of stock'], 400);
    }

    public function update(Request $request, $id)
    {
        try {
            $product = Product::find($id);

            if (!$product) {
                return response()->json(['message' => 'Product not found'], 404);
            }

            $request->validate([
                'name'     => 'required|string',
                'category' => 'required|string',
                'price'    => 'required|numeric',
                'stock'    => 'required|integer',
                'image'    => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            ]);

            if ($request->hasFile('image')) {
                $image = $request->file('image');
                $imageName = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
                $image->move(public_path('uploads/products'), $imageName);
                $product->image = asset('uploads/products/' . $imageName);
            } elseif ($request->image_url) {
                $product->image = $request->image_url;
            }

            $product->name        = $request->name;
            $product->category    = $request->category;
            $product->price       = $request->price;
            $product->discount    = $request->discount ?? $product->discount;
            $product->stock       = $request->stock ?? $product->stock;
            $product->description = $request->description ?? $product->description;

            $product->save();

            return response()->json([
                'status'  => 'success',
                'message' => 'Product Updated Successfully!',
                'product' => $product
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    //Prodect (Delete)
    public function destroy($id)
    {
        try {
            $product = Product::find($id);

            if (!$product) {
                return response()->json(['message' => 'Product not found'], 404);
            }

            $product->delete();

            return response()->json([
                'status'  => 'success',
                'message' => 'Product Deleted Successfully!'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
