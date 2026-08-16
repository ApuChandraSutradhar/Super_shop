<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class LoginController extends Controller
{
    /**
     * Handle React API Universal Login Request (Admin, Delivery, Customer)
     */
    public function login(Request $request)
    {
        // ১. ভ্যালিডেশন
        $validator = Validator::make($request->all(), [
            'phone'    => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // ২. ইউজার চেক
        $user = User::where('phone', $request->phone)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'status'  => false,
                'message' => 'Invalid phone number or password!'
            ], 401);
        }

        // ৩. ডেলিভারি ম্যানের জন্য এপ্রুভাল চেক
        $userRole = strtolower(trim($user->role ?? ''));
        if ($userRole === 'delivery' && isset($user->is_approved) && !$user->is_approved) {
            return response()->json([
                'status'  => false,
                'message' => 'Your delivery account is pending Admin approval!'
            ], 403);
        }

        // ৪. Token জেনারেট
        $token = $user->createToken('auth_token')->plainTextToken;

        // ৫. JSON রেসপন্স (সকল রোলের জন্য সফল)
        return response()->json([
            'status'       => true,
            'message'      => 'Logged in successfully!',
            'user'         => $user,
            'access_token' => $token,
            'token_type'   => 'Bearer',
        ], 200);
    }
}