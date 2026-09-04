<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Support\Facades\DB;
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
            $category = strtolower(trim($request->category));
            $query->where(function ($categoryQuery) use ($category) {
                $categoryQuery->whereRaw('LOWER(category) = ?', [$category]);

                if (in_array($category, ['vegetables', 'fresh vegetables'], true)) {
                    $categoryQuery->orWhereRaw("LOWER(category) IN (?, ?)", ['vegetables', 'fresh vegetables']);
                }
            });
        }

        if ($request->filled('search')) {
            $search = trim($request->string('search')->value());
            $query->where('name', 'like', "%{$search}%");
        }

        $query->latest('id');
        $suggestion = null;

        if ($request->boolean('paginate')) {
            $products = $query->paginate($request->integer('per_page', 12))->withQueryString();

            if ($products->isEmpty() && isset($search) && $search !== '') {
                $suggestion = $this->findSearchSuggestion($search);
            }

            return response()->json(array_merge($products->toArray(), [
                'suggestion' => $suggestion,
            ]), 200);
        }

        return response()->json($query->get(), 200);
    }

    public function trending(Request $request)
    {
        $request->validate([
            'limit' => ['nullable', 'integer', 'min:4', 'max:8'],
        ]);

        $sales = DB::table('order_items')
            ->join('orders', 'orders.order_id', '=', 'order_items.order_id')
            ->where('orders.order_status', '!=', 'cancelled')
            ->select('order_items.product_id', DB::raw('SUM(order_items.quantity) as sales_count'))
            ->groupBy('order_items.product_id');

        $products = Product::query()
            ->withAvg('feedbacks as rating', 'rating_stars')
            ->withCount('feedbacks as review')
            ->leftJoinSub($sales, 'product_sales', function ($join) {
                $join->on('products.id', '=', 'product_sales.product_id');
            })
            ->select('products.*', DB::raw('COALESCE(product_sales.sales_count, 0) as sales_count'))
            ->orderByDesc('sales_count')
            ->latest('products.id')
            ->limit($request->integer('limit', 8))
            ->get();

        return response()->json($products, 200);
    }

    public function recommended(Request $request)
    {
        $user = $request->user();

        $preferredCategory = DB::table('order_items')
            ->join('orders', 'orders.order_id', '=', 'order_items.order_id')
            ->join('products', 'products.id', '=', 'order_items.product_id')
            ->where('orders.customer_id', $user->id)
            ->where('orders.order_status', '!=', 'cancelled')
            ->whereNotNull('products.category')
            ->select('products.category', DB::raw('SUM(order_items.quantity) as category_sales'))
            ->groupBy('products.category')
            ->orderByDesc('category_sales')
            ->value('category');

        $query = Product::query()
            ->withAvg('feedbacks as rating', 'rating_stars')
            ->withCount('feedbacks as review')
            ->when($preferredCategory, function ($productQuery) use ($preferredCategory) {
                $productQuery->where('category', $preferredCategory);
            })
            ->orderByDesc('rating')
            ->latest('id')
            ->limit(8);

        return response()->json($query->get(), 200);
    }

    private function findSearchSuggestion(string $search): ?string
    {
        $normalizedSearch = strtolower($search);
        $closestWord = null;
        $closestDistance = PHP_INT_MAX;

        foreach (Product::query()->whereNotNull('name')->distinct()->pluck('name') as $name) {
            $nameWords = preg_split('/[^[:alnum:]]+/', trim($name), -1, PREG_SPLIT_NO_EMPTY) ?: [];

            foreach ($nameWords as $nameWord) {
                $distance = levenshtein($normalizedSearch, strtolower($nameWord));

                if ($distance < $closestDistance) {
                    $closestDistance = $distance;
                    $closestWord = $nameWord;
                }
            }
        }

        return $closestDistance <= 3 ? $closestWord : null;
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
