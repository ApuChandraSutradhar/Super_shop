<?php

namespace App\Http\Controllers;

use App\Models\Coupon;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ChatAssistantController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'message' => ['required', 'string', 'max:2000'],
        ]);

        $apiKey = env('GEMINI_API_KEY') ?? config('services.gemini.key');
        $model = config('services.gemini.model', 'gemini-3.6-flash');

        if (blank($apiKey)) {
            Log::error('Gemini API key is missing from the application configuration.');

            return response()->json([
                'reply' => 'Gemini API Key is missing in .env',
            ]);
        }

        $catalog = Product::query()
            ->select(['name', 'category', 'price', 'stock', 'discount'])
            ->orderBy('category')
            ->orderBy('name')
            ->get()
            ->map(fn (Product $product): array => [
                'name' => $product->name,
                'category' => $product->category ?: 'Uncategorized',
                'price' => (float) $product->price,
                'stock' => (int) $product->stock,
                'discount_percent' => (float) $product->discount,
            ])
            ->values();

        $activeOffers = Coupon::query()
            ->whereNull('user_id')
            ->where('is_used', false)
            ->whereDate('valid_until', '>=', now()->toDateString())
            ->get(['coupon_code', 'discount_amount', 'min_purchase_amount', 'valid_until'])
            ->map(fn (Coupon $coupon): array => [
                'code' => $coupon->coupon_code,
                'discount_amount' => (float) $coupon->discount_amount,
                'minimum_purchase_amount' => (float) $coupon->min_purchase_amount,
                'valid_until' => (string) $coupon->valid_until,
            ])
            ->values();

        $productContext = $catalog->map(fn (array $product): string => sprintf(
            '- %s | Category: %s | Price: %.2f | Stock: %d | Discount: %.2f%%',
            $product['name'],
            $product['category'],
            $product['price'],
            $product['stock'],
            $product['discount_percent'],
        ))->implode("\n");

        $offerContext = $activeOffers->isEmpty()
            ? 'No active public offers.'
            : $activeOffers->map(fn (array $offer): string => sprintf(
                '- %s: %.2f off on purchases of %.2f or more; valid until %s',
                $offer['code'],
                $offer['discount_amount'],
                $offer['minimum_purchase_amount'],
                $offer['valid_until'],
            ))->implode("\n");

        $prompt = <<<PROMPT
You are the friendly SuperShop Customer Support Assistant. Answer clearly and helpfully using only the live store information below. Do not invent product availability, prices, discounts, offers, delivery rules, return rules, or policies. Treat a stock quantity of 0 as out of stock. If an answer is unavailable, say so and direct the customer to support. Keep answers concise.

Products, prices, stock, and discounts:
{$productContext}

Categories: {$catalog->pluck('category')->unique()->implode(', ')}

Active offers:
{$offerContext}

Shop policies: Orders may be cancelled before delivery from My Orders. Refund eligibility depends on order status. Approved refunds usually take 3-7 business days. Delivery times are estimates and can change due to traffic, weather, or availability. Customer data is used to process orders, arrange delivery, and provide support; it is not sold.

User Question: {$validated['message']}
PROMPT;

        try {
            $response = Http::timeout(20)
                ->withHeaders([
                    'Content-Type' => 'application/json',
                    'Accept' => 'application/json',
                ])
                ->post("https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}", [
                    'contents' => [
                        [
                            'parts' => [['text' => $prompt]],
                        ],
                    ],
                    'generationConfig' => [
                        'temperature' => 0.2,
                        'maxOutputTokens' => 400,
                    ],
                ]);
        } catch (\Throwable $exception) {
            Log::error('Gemini API request failed before receiving a response.', [
                'exception' => $exception->getMessage(),
            ]);

            return response()->json([
                'reply' => 'Sorry, I am currently having trouble connecting to Gemini API.',
            ]);
        }

        if (! $response->successful()) {
            Log::error('Gemini API returned an error response.', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return response()->json([
                'reply' => 'Sorry, I am currently having trouble connecting to Gemini API.',
            ]);
        }

        $reply = data_get($response->json(), 'candidates.0.content.parts.0.text');

        if (! is_string($reply) || blank($reply)) {
            Log::error('Gemini API returned a successful response without assistant text.', [
                'body' => $response->body(),
            ]);

            return response()->json([
                'reply' => 'Sorry, I am currently having trouble connecting to Gemini API.',
            ]);
        }

        return response()->json(['reply' => trim($reply)]);
    }
}
