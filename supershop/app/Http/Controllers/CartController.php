<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\CartItem;
use Illuminate\Http\Request;

class CartController extends Controller
{
    // Add or Update product quantity in user cart
    public function addToCart(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'product_id' => 'required|exists:products,id',
            'quantity' => 'nullable|integer|min:1',
        ]);

        $userId = $request->user_id;
        $productId = $request->product_id;
        $quantity = $request->quantity ?? 1;

        // Retrieve existing cart or create a new cart for user
        $cart = Cart::firstOrCreate(['user_id' => $userId]);

        // Check if item already exists in cart_items
        $cartItem = CartItem::where('cart_id', $cart->cart_id)
            ->where('product_id', $productId)
            ->first();

        if ($cartItem) {
            $cartItem->quantity += $quantity;
            $cartItem->save();
        } else {
            CartItem::create([
                'cart_id' => $cart->cart_id,
                'product_id' => $productId,
                'quantity' => $quantity,
            ]);
        }

        // Fetch updated cart with products
        $updatedCart = Cart::where('cart_id', $cart->cart_id)
            ->with('items.product')
            ->first();

        return response()->json([
            'status' => 'success',
            'message' => 'Product added to cart successfully',
            'cart' => $updatedCart,
        ], 200);
    }

    // Get cart items for logged in user
    public function getCart($userId)
    {
        $cart = Cart::where('user_id', $userId)->with('items.product')->first();

        if (!$cart) {
            return response()->json(['items' => []], 200);
        }

        return response()->json($cart, 200);
    }

    // Update product quantity in cart
    public function updateQuantity(Request $request)
    {
        $request->validate([
            'cart_item_id' => 'required',
            'quantity' => 'required|integer|min:1',
        ]);

        $cartItem = CartItem::where('cart_item_id', $request->cart_item_id)->first();

        if ($cartItem) {
            $cartItem->quantity = $request->quantity;
            $cartItem->save();

            return response()->json([
                'status' => 'success',
                'message' => 'Quantity updated successfully'
            ], 200);
        }

        return response()->json(['message' => 'Cart item not found'], 404);
    }

    // Remove single item from database cart
    public function removeItem($cart_item_id)
    {
        $deleted = CartItem::where('cart_item_id', $cart_item_id)->delete();

        if ($deleted) {
            return response()->json([
                'status' => 'success',
                'message' => 'Item removed from cart successfully'
            ], 200);
        }

        return response()->json(['message' => 'Item not found'], 404);
    }
}