<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    public function index()
    {
        // DB-এর payments টেবিল থেকে সব রেকর্ডের তথ্য নিয়ে আসা হচ্ছে
        $payments = DB::table('payments')->get();

        return response()->json([
            'status' => 'success',
            'payments' => $payments
        ]);
    }
}