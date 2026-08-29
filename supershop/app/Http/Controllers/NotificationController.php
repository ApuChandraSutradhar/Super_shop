<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $userId = auth()->id() ?? $request->user()?->id;

        if (! $userId) {
            return response()->json([
                'success' => false,
                'notifications' => [],
                'unread_count' => 0,
            ], 401);
        }

        $notifications = Notification::query()
            ->where('user_id', $userId)
            ->orderByDesc('created_at')
            ->get();

        $unreadCount = Notification::query()
            ->where('user_id', $userId)
            ->where('is_read', false)
            ->count();

        return response()->json([
            'success' => true,
            'notifications' => $notifications,
            'unread_count' => $unreadCount,
        ]);
    }

    public function markRead(Request $request)
    {
        $data = $request->validate([
            'notification_ids' => ['nullable', 'array'],
            'notification_ids.*' => ['integer', 'exists:notifications,id'],
        ]);

        $query = Notification::query()
            ->where('user_id', $request->user()->id)
            ->where('is_read', false);

        if (! empty($data['notification_ids'])) {
            $query->whereIn('id', $data['notification_ids']);
        }

        $updated = $query->update(['is_read' => true]);

        return response()->json(['success' => true, 'marked_read' => $updated]);
    }
}
