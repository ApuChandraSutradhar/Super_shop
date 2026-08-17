<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CouponController;

Route::get('/coupons', [CouponController::class, 'getUserCoupons']);

Route::post('/login', [AuthController::class, 'login']);
Route::post('/delivery/register', [AuthController::class, 'registerDelivery']);
Route::get('/admin/pending-deliveries', [AuthController::class, 'getPendingDeliveries']);
Route::post('/admin/approve-delivery/{id}', [AuthController::class, 'approveDelivery']);

// Customer Place Order
Route::post('/place-order', [OrderController::class, 'placeOrder']);
Route::get('/user-coupons/{userId}', [OrderController::class, 'getUserCoupons']);

// Admin Endpoints
Route::get('/admin/orders', [OrderController::class, 'getAllOrdersForAdmin']);
Route::put('/admin/orders/{id}/status', [OrderController::class, 'updateOrderStatus']);

// Cart Routes
Route::post('/cart/add', [CartController::class, 'addToCart']);
Route::get('/cart/{userId}', [CartController::class, 'getCart']);
Route::put('/cart/update', [CartController::class, 'updateQuantity']);
Route::delete('/cart/remove/{cart_item_id}', [CartController::class, 'removeItem']);

// Auth Routes
Route::post('/register', [RegisterController::class, 'register']);
Route::post('/login', [LoginController::class, 'login']);

// Product Routes
Route::post('/products', [ProductController::class, 'store']);
Route::get('/products', [ProductController::class, 'index']);
Route::post('/products/{id}/buy', [ProductController::class, 'decrementStock']);

// POST এবং PUT দুটো মেথডই সাপোর্ট করার জন্য Match ব্যবহার করা হয়েছে
Route::match(['post', 'put'], '/products/{id}', [ProductController::class, 'update']); 
Route::delete('/products/{id}', [ProductController::class, 'destroy']); 

// Authenticated User Info
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});