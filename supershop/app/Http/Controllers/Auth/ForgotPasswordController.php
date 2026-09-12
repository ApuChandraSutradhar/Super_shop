<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\Rule;

class ForgotPasswordController extends Controller
{
    public function requestOtp(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email', 'exists:users,email'],
            'role' => ['nullable', Rule::in(['customer', 'delivery', 'admin'])],
        ]);

        $userQuery = User::where('email', $validated['email']);
        if (! empty($validated['role'])) {
            $userQuery->where('role', $validated['role']);
        }
        if (! $userQuery->exists()) {
            return response()->json(['status' => false, 'message' => 'No account was found for that email address.'], 422);
        }

        $otp = (string) random_int(100000, 999999);

        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $validated['email']],
            [
                'token' => Hash::make($otp),
                'created_at' => now(),
            ]
        );

        Mail::raw("Your SuperShop password reset OTP is {$otp}. It expires in 10 minutes.", function ($message) use ($validated): void {
            $message->to($validated['email'])
                ->subject('SuperShop password reset OTP');
        });

        return response()->json([
            'status' => true,
            'message' => 'A 6-digit OTP has been sent to your email address.',
        ]);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email', 'exists:users,email'],
            'role' => ['nullable', Rule::in(['customer', 'delivery', 'admin'])],
            'otp' => ['required', 'digits:6'],
            'password' => ['required', 'confirmed', Password::min(6)],
        ]);

        $userQuery = User::where('email', $validated['email']);
        if (! empty($validated['role'])) {
            $userQuery->where('role', $validated['role']);
        }
        $user = $userQuery->first();
        if (! $user) {
            return response()->json(['status' => false, 'message' => 'No account was found for that email address.'], 422);
        }

        $resetToken = DB::table('password_reset_tokens')
            ->where('email', $validated['email'])
            ->first();

        if (! $resetToken || ! Hash::check($validated['otp'], $resetToken->token) || now()->diffInMinutes($resetToken->created_at) > 10) {
            return response()->json([
                'status' => false,
                'message' => 'The OTP is invalid or expired.',
            ], 422);
        }

        $user->update(['password' => Hash::make($validated['password'])]);

        DB::table('password_reset_tokens')->where('email', $validated['email'])->delete();

        return response()->json([
            'status' => true,
            'message' => 'Password reset successfully. You can now log in.',
        ]);
    }
}
