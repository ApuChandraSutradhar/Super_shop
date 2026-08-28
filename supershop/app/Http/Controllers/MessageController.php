<?php

namespace App\Http\Controllers;

use App\Models\Message;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'message' => ['required', 'string', 'max:5000'],
        ]);

        $message = Message::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Thank you for contacting us!',
            'data' => $message,
        ], 201);
    }

    public function index()
    {
        return response()->json([
            'success' => true,
            'messages' => Message::query()->latest('created_at')->get(),
        ]);
    }
}
