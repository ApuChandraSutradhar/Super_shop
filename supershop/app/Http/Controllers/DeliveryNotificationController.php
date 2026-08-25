<?php

namespace App\Http\Controllers;

use App\Models\AdminNotification;
use App\Models\User;
use Illuminate\Http\Request;

class DeliveryNotificationController extends Controller
{
    public function index(Request $request)
    {
        $riderId = $this->riderId($request);
        $notifications = AdminNotification::where('delivery_rider_id', $riderId)->latest()->limit(20)->get();

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $notifications->where('is_read', false)->count(),
        ]);
    }

    public function markAsRead(Request $request, AdminNotification $notification)
    {
        abort_unless($notification->delivery_rider_id === $this->riderId($request), 404);

        if (! $notification->is_read) {
            $notification->update(['is_read' => true, 'read_at' => now()]);
        }

        return response()->json(['notification' => $notification->fresh()]);
    }

    private function riderId(Request $request): int
    {
        $data = $request->validate(['delivery_person_id' => ['required', 'integer', 'exists:users,id']]);
        User::whereKey($data['delivery_person_id'])->where('role', 'delivery')->firstOrFail();

        return (int) $data['delivery_person_id'];
    }
}
