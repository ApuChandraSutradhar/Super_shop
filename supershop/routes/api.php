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
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DeliveryRiderController;
use App\Http\Controllers\PaymentController; // PaymentController ইমপোর্ট করা হলো

// Coupon Routes
Route::get('/coupons', [CouponController::class, 'getUserCoupons']);

// Delivery & Auth Routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/delivery/register', [AuthController::class, 'registerDelivery']);
Route::get('/admin/pending-deliveries', [AuthController::class, 'getPendingDeliveries']);
Route::post('/admin/approve-delivery/{id}', [AuthController::class, 'approveDelivery']);

// Delivery Riders Routes
Route::get('/delivery-riders', [DeliveryRiderController::class, 'index']);
Route::patch('/delivery-riders/{id}/status', [DeliveryRiderController::class, 'updateStatus']);

// Admin Payments Route (নতুন যোগ করা হয়েছে)
Route::get('/payments', [PaymentController::class, 'index']);

// Customer Place Order & Coupons
Route::post('/place-order', [OrderController::class, 'placeOrder']);
Route::get('/user-coupons/{userId}', [OrderController::class, 'getUserCoupons']);

// Admin Order APIs
Route::get('/admin/orders', [OrderController::class, 'getAllOrdersForAdmin']);
Route::patch('/admin/orders/{id}/status', [OrderController::class, 'updateOrderStatus']);

// Admin Customers APIs
Route::get('/admin/customers', [CustomerController::class, 'index']);
Route::patch('/admin/customers/{id}/status', [CustomerController::class, 'updateStatus']);

// Cart Routes
Route::post('/cart/add', [CartController::class, 'addToCart']);
Route::get('/cart/{userId}', [CartController::class, 'getCart']);
Route::put('/cart/update', [CartController::class, 'updateQuantity']);
Route::delete('/cart/remove/{cart_item_id}', [CartController::class, 'removeItem']);

// Auth Routes
Route::post('/register', [RegisterController::class, 'register']);

// Product Routes
Route::post('/products', [ProductController::class, 'store']);
Route::get('/products', [ProductController::class, 'index']);
Route::post('/products/{id}/buy', [ProductController::class, 'decrementStock']);
Route::match(['post', 'put'], '/products/{id}', [ProductController::class, 'update']); 
Route::delete('/products/{id}', [ProductController::class, 'destroy']); 

// Authenticated User Info
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});