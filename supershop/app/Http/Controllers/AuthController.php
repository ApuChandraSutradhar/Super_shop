<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    // 🔑 কমন লগইন (Admin, Delivery, Customer সবার জন্য)
    public function login(Request $request)
    {
        $request->validate([
            'phone'    => 'required',
            'password' => 'required',
        ]);

        $user = User::where('phone', $request->phone)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['success' => false, 'message' => 'Invalid credentials'], 401);
        }

        // কেস-ইনসেনসিটিভ চেক (delivery/Delivery)
        $userRole = strtolower(trim($user->role ?? ''));

        // ডেলিভারি ম্যানের ক্ষেত্রে এডমিন এপ্রুভ করেছে কিনা চেক
        if ($userRole === 'delivery' && isset($user->is_approved) && !$user->is_approved) {
            return response()->json([
                'success' => false,
                'message' => 'Your delivery account is pending Admin approval!'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'user'    => $user
        ]);
    }

    // 🚚 ডেলিভারি ম্যান রেজিস্ট্রেশন (Status থাকবে Pending / is_approved = 0)
    public function registerDelivery(Request $request)
    {
        $request->validate([
            'name'     => 'required|string',
            'phone'    => 'required|unique:users,phone',
            'password' => 'required|min:4',
        ]);

        $user = User::create([
            'name'        => $request->name,
            'phone'       => $request->phone,
            'email'       => $request->email ?? null,
            'password'    => Hash::make($request->password),
            'role'        => 'delivery',
            'is_approved' => 0,
        ]);

        // Mass assignment ব্লক থাকলে বাধ্যতামূলকভাবে 'delivery' সেট করা
        if ($user->role !== 'delivery') {
            $user->role = 'delivery';
            $user->is_approved = 0;
            $user->save();
        }

        return response()->json([
            'success' => true,
            'message' => 'Registration submitted! Awaiting Admin approval.',
            'user'    => $user
        ], 201);
    }

    // 👨‍💼 প্যান্ডিং ডেলিভারি ম্যানের লিস্ট
    public function getPendingDeliveries()
    {
        $pending = User::whereRaw('LOWER(role) = ?', ['delivery'])
            ->where('is_approved', 0)
            ->get();

        return response()->json(['success' => true, 'deliveries' => $pending]);
    }

    // 👨‍💼 এডমিন কর্তৃক এপ্রুভ করা
    public function approveDelivery($id)
    {
        $user = User::findOrFail($id);
        $user->is_approved = 1;
        $user->save();

        return response()->json(['success' => true, 'message' => 'Delivery Man approved successfully!']);
    }
}