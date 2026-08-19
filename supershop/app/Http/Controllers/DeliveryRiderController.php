<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class DeliveryRiderController extends Controller
{
    // Fetch all delivery riders
    public function index()
    {
        // DB-এর users টেবিল থেকে role = 'delivery' ফিল্টার করা হয়েছে
        $riders = User::where('role', 'delivery')->get();

        return response()->json([
            'status' => 'success',
            'riders' => $riders
        ]);
    }

    // Toggle rider approval / block status
    public function updateStatus(Request $request, $id)
    {
        $rider = User::findOrFail($id);
        $rider->is_approved = $request->is_approved;
        $rider->save();

        return response()->json([
            'message' => 'Status updated successfully',
            'rider' => $rider
        ]);
    }
}