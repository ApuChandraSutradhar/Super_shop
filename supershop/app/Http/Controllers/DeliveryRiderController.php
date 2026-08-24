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
        $riders = User::where('role', 'delivery')
            ->when(request()->boolean('approved'), fn ($query) => $query->where('is_approved', 1))
            ->get();

        return response()->json([
            'status' => 'success',
            'riders' => $riders
        ]);
    }

    // Toggle rider approval / block status
    public function updateStatus(Request $request, $id)
    {
        $request->validate(['is_approved' => ['required', 'boolean']]);
        $rider = User::where('id', $id)->where('role', 'delivery')->firstOrFail();
        $rider->is_approved = $request->boolean('is_approved');
        $rider->save();

        return response()->json([
            'message' => 'Status updated successfully',
            'rider' => $rider
        ]);
    }
}
