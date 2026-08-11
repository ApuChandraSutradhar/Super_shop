<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'message' => 'SuperShop Backend API is running successfully!'
    ]);
});