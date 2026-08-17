<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function store(Request $request)
    {
        try {
            // ১. ভ্যালিডেশন
            $request->validate([
                'name'     => 'required|string',
                'category' => 'required|string',
                'price'    => 'required|numeric',
                'stock'    => 'required|integer',
                'image'    => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048', // ২MB সর্বোচ্চ
            ]);

            $imageUrl = '';

            // ২. ল্যাপটপ থেকে ইমেজ ফাইল আপলোড হ্যান্ডলিং
            if ($request->hasFile('image')) {
                $image = $request->file('image');
                $imageName = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
                
                // public/uploads/products ফোল্ডারে সেভ হবে
                $image->move(public_path('uploads/products'), $imageName);
                
                // ছবির সম্পূর্ণ URL তৈরি
                $imageUrl = asset('uploads/products/' . $imageName);
            } elseif ($request->image_url) {
                // যদি কেউ URL দেয়
                $imageUrl = $request->image_url;
            }

            // ৩. প্রডাক্ট তৈরি
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
            $product->decrement('stock', 1);
            return response()->json([
                'status'  => 'success',
                'message' => 'Stock updated successfully',
                'stock'   => $product->stock
            ], 200);
        }

        return response()->json(['message' => 'Out of stock'], 400);
    }

    // 🔴 প্রডাক্ট আপডেট (Edit/Update) করার মেথড
    public function update(Request $request, $id)
    {
        try {
            $product = Product::find($id);

            if (!$product) {
                return response()->json(['message' => 'Product not found'], 404);
            }

            // ভ্যালিডেশন
            $request->validate([
                'name'     => 'required|string',
                'category' => 'required|string',
                'price'    => 'required|numeric',
                'stock'    => 'required|integer',
                'image'    => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            ]);

            // নতুন ছবি সিলেক্ট করলে আপলোড হ্যান্ডলিং
            if ($request->hasFile('image')) {
                $image = $request->file('image');
                $imageName = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
                $image->move(public_path('uploads/products'), $imageName);
                $product->image = asset('uploads/products/' . $imageName);
            } elseif ($request->image_url) {
                $product->image = $request->image_url;
            }

            // তথ্য আপডেট
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

    // 🔴 প্রডাক্ট মুছে ফেলার (Delete) মেথড
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