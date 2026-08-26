<?php

use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\AdminNotificationController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CashCollectionController;
use App\Http\Controllers\CouponController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DeliveryNotificationController;
use App\Http\Controllers\DeliveryOrderController;
use App\Http\Controllers\DeliveryRiderController;
use App\Http\Controllers\FeedbackController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\RefundController;
use App\Http\Controllers\ReportController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

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
Route::patch('/admin/delivery-riders/{id}/status', [DeliveryRiderController::class, 'updateStatus']);

// Admin Payments Route
Route::get('/payments', [PaymentController::class, 'index']);
Route::get('/admin/dashboard', [AdminDashboardController::class, 'index']);
Route::get('/admin/cash-collections', [CashCollectionController::class, 'index']);
Route::patch('/admin/cash-collections/{delivery}/settle', [CashCollectionController::class, 'settle']);

// Admin Reports Route
Route::get('/admin/reports', [ReportController::class, 'getReports']);

// Admin notifications
Route::get('/admin/notifications', [AdminNotificationController::class, 'index']);
Route::patch('/admin/notifications/{notification}/read', [AdminNotificationController::class, 'markAsRead']);
Route::get('/delivery/notifications', [DeliveryNotificationController::class, 'index']);
Route::patch('/delivery/notifications/{notification}/read', [DeliveryNotificationController::class, 'markAsRead']);

// Customer Place Order & Coupons
Route::post('/place-order', [OrderController::class, 'placeOrder']);
Route::get('/orders', [OrderController::class, 'getCustomerOrders']);
Route::get('/user-coupons/{userId}', [OrderController::class, 'getUserCoupons']);

// Admin Order APIs
Route::get('/admin/orders', [OrderController::class, 'getAllOrdersForAdmin']);
Route::patch('/admin/orders/{id}/status', [OrderController::class, 'updateOrderStatus']);
Route::patch('/admin/orders/{id}/delivery-rider', [OrderController::class, 'assignDeliveryRider']);

// Customer cancellation requests and admin refund review
Route::post('/refunds', [RefundController::class, 'store']);
Route::get('/refunds/{orderId}', [RefundController::class, 'showForCustomer']);
Route::get('/admin/refunds', [RefundController::class, 'index']);
Route::patch('/admin/refunds/{refund}/status', [RefundController::class, 'updateStatus']);

// Delivery rider order APIs
Route::get('/delivery/dashboard', [DeliveryOrderController::class, 'dashboard']);
Route::get('/delivery/orders', [DeliveryOrderController::class, 'assignedOrders']);
Route::patch('/delivery/orders/{id}/status', [DeliveryOrderController::class, 'updateStatus']);

// Customer feedback API
Route::post('/feedback', [FeedbackController::class, 'store']);

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
