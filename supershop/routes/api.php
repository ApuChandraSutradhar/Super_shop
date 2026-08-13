<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CartController;

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

// Authenticated User Info
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});