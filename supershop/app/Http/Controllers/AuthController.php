<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\AdminNotification;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    // Login  (Admin, Delivery, Customer)
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

        $userRole = strtolower(trim($user->role ?? ''));

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

    //(Status Pending / is_approved = 0)
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

        // Mass assignment 'delivery' role and is_approved = 0
        if ($user->role !== 'delivery') {
            $user->role = 'delivery';
            $user->is_approved = 0;
            $user->save();
        }

        AdminNotification::record(
            'delivery_registration',
            'New delivery rider awaiting approval',
            "{$user->name} registered as a delivery rider.",
            '/admin/delivery-riders',
            ['rider_id' => $user->id]
        );

        return response()->json([
            'success' => true,
            'message' => 'Registration submitted! Awaiting Admin approval.',
            'user'    => $user
        ], 201);
    }

    public function getPendingDeliveries()
    {
        $pending = User::whereRaw('LOWER(role) = ?', ['delivery'])
            ->where('is_approved', 0)
            ->get();

        return response()->json(['success' => true, 'deliveries' => $pending]);
    }

    public function approveDelivery($id)
    {
        $user = User::findOrFail($id);
        $user->is_approved = 1;
        $user->save();

        return response()->json(['success' => true, 'message' => 'Delivery Man approved successfully!']);
    }
}
