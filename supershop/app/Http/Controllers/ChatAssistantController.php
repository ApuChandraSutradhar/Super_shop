<?php

namespace App\Http\Controllers;

use App\Models\Coupon;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ChatAssistantController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate(['message' => ['required', 'string', 'max:2000']]);
        $catalog = $this->catalog();

        // Database and project-policy answers do not depend on an external AI service.
        $localReply = $this->localReply($catalog, $validated['message']);
        if ($localReply !== null) {
            return response()->json(['reply' => $localReply]);
        }

        $apiKey = env('GEMINI_API_KEY') ?? config('services.gemini.key');
        if (blank($apiKey)) {
            Log::warning('Gemini API key is missing; using the safe assistant response.');
            return response()->json(['reply' => $this->unavailableReply()]);
        }

        $model = config('services.gemini.model', 'gemini-3.6-flash');
        $payload = [
            'systemInstruction' => ['parts' => [['text' => $this->systemInstruction($catalog)]]],
            'contents' => [['role' => 'user', 'parts' => [['text' => $validated['message']]]]],
            'generationConfig' => ['temperature' => 0.2, 'maxOutputTokens' => 800],
        ];

        try {
            $response = Http::timeout(20)->acceptJson()->post(
                "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}",
                $payload,
            );
        } catch (\Throwable $exception) {
            Log::error('Gemini API request failed.', ['exception' => $exception->getMessage()]);
            return response()->json(['reply' => $this->unavailableReply()]);
        }

        if ($response->failed()) {
            Log::error('Gemini API returned an error response.', ['status' => $response->status(), 'body' => $response->body()]);
            return response()->json(['reply' => $this->unavailableReply()]);
        }

        $reply = $response->json('candidates.0.content.parts.0.text');
        return response()->json(['reply' => is_string($reply) && filled($reply) ? trim($reply) : $this->unavailableReply()]);
    }

    /** @return Collection<int, array{name:string,category:string,price:float,stock:int,discount_percent:float,discounted_price:float,description:string}> */
    private function catalog(): Collection
    {
        return Product::query()->select(['name', 'category', 'price', 'discount', 'stock', 'description'])
            ->orderBy('category')->orderBy('name')->get()
            ->map(fn (Product $product): array => [
                'name' => $product->name,
                'category' => $product->category ?: 'Uncategorized',
                'price' => (float) $product->price,
                'stock' => (int) $product->stock,
                'discount_percent' => (float) $product->discount,
                'discounted_price' => (float) $product->price * (1 - ((float) $product->discount / 100)),
                'description' => trim((string) $product->description),
            ])->values();
    }

    private function systemInstruction(Collection $catalog): string
    {
        $products = $catalog->map(function (array $product): string {
            $stock = $product['stock'] > 0 ? "In stock ({$product['stock']} left)" : 'Out of stock';
            return "- {$product['name']} | {$product['category']} | Regular: ৳{$product['price']} | Discount: {$product['discount_percent']}% | Selling: ৳{$product['discounted_price']} | {$stock} | {$product['description']}";
        })->implode("\n");
        $offers = Coupon::query()->whereNull('user_id')->where('is_used', false)->whereDate('valid_until', '>=', now()->toDateString())
            ->get(['coupon_code', 'discount_amount', 'min_purchase_amount', 'valid_until'])
            ->map(fn (Coupon $coupon): string => "- {$coupon->coupon_code}: ৳{$coupon->discount_amount} off orders over ৳{$coupon->min_purchase_amount}; valid until {$coupon->valid_until}")
            ->implode("\n") ?: 'No active public offers.';
        $delivery = config('shop_assistant.delivery');
        $refund = config('shop_assistant.refund');
        $eta = $delivery['eta'] ?: 'No fixed delivery time in minutes is configured; it varies with location, traffic, weather, rider, and stock availability.';

        return <<<PROMPT
You are SuperShop / FreshMart's friendly customer-support assistant. Respond naturally and concisely in the customer's language (Bangla, English, or Banglish), including greetings, thanks, and ordinary conversational questions.

LIVE DATABASE INVENTORY (the only authority for product names, prices, discounts, categories, and stock):
{$products}

ACTIVE OFFERS:
{$offers}

STORE FACTS:
- Delivery: inside Dhaka ৳{$delivery['inside_dhaka_fee']}; outside Dhaka ৳{$delivery['outside_dhaka_fee']}. {$eta}
- Orders can be cancelled in My Orders before delivery. Approved refunds generally take {$refund['processing_days']}. A shipping order has a {$refund['shipping_deduction_percent']}% product-price deduction plus the non-refundable delivery fee.
- Payments: Cash on Delivery, bKash, Nagad, and card.
- Customer data is used for orders, delivery, and support and is not sold.

Never invent a store fact or an individual order status. If store data lacks an answer, say that clearly and suggest the relevant page or support. Do not reply that you do not want to answer or merely ask the customer to try again.
PROMPT;
    }

    private function localReply(Collection $catalog, string $message): ?string
    {
        $text = Str::lower($message);
        if (preg_match('/\b(hello|hi|hey|hallo|salam|assalamualaikum)\b/u', $text)) {
            return 'Hello! I am the SuperShop / FreshMart assistant. How can I help you today?';
        }
        if (Str::contains($text, ['kamon achen', 'kamon acho', 'kemon acho', 'kemon achen', 'kemon achhen'])) {
            return 'Ami valo achi, dhonnobad! Apni kamon achen? Ajke kon product ba offer niye jante chan?';
        }
        if (Str::contains($text, ['how are you'])) {
            return 'I am doing well, thank you! How are you? How can I help with products, delivery, or your order today?';
        }
        if (Str::contains($text, ['thanks', 'thank you', 'thankyou', 'dhonnobad', 'dhanyabad', 'tnx'])) {
            return 'You are most welcome! Feel free to explore more products and offers from SuperShop / FreshMart. I am always here if you need help choosing something.';
        }
        if (Str::contains($text, ['delivery', 'deliver', 'shipping', 'koto minute', 'koto khon', 'kokhon pabo', 'rider'])) {
            $delivery = config('shop_assistant.delivery');
            $eta = $delivery['eta'] ? "Current delivery estimate: {$delivery['eta']}." : 'There is no fixed delivery promise in minutes; it depends on location, traffic, weather, rider availability, and stock.';
            return "{$eta} Delivery fee is ৳{$delivery['inside_dhaka_fee']} inside Dhaka and ৳{$delivery['outside_dhaka_fee']} outside Dhaka.";
        }
        if (Str::contains($text, ['cancel', 'cancellation', 'refund', 'return'])) {
            $refund = config('shop_assistant.refund');
            return "You can cancel an order from My Orders before delivery. Approved refunds usually take {$refund['processing_days']}; eligibility depends on order status. Shipping orders have a {$refund['shipping_deduction_percent']}% product-price deduction plus delivery charge.";
        }
        if (Str::contains($text, ['payment', 'cash on delivery', 'cod', 'bkash', 'nagad', 'card'])) {
            return 'You can pay by Cash on Delivery (COD), bKash, Nagad, or card at checkout.';
        }
        if (Str::contains($text, ['privacy', 'personal data', 'information'])) {
            return 'We use your information to process orders, arrange delivery, and provide support. We do not sell your personal information.';
        }

        $category = $catalog->pluck('category')->unique()->first(fn (string $item): bool => Str::contains($text, Str::lower($item)));
        if ($category && Str::contains($text, ['category', 'product', 'ki ki', 'available'])) {
            return "{$category} category te available products: ".$catalog->where('category', $category)->pluck('name')->implode(', ').'.';
        }
        if (Str::contains($text, ['all product', 'all products', 'ki ki product'])) {
            return 'Available categories: '.$catalog->pluck('category')->unique()->implode(', ').'.';
        }

        $product = $catalog->first(function (array $item) use ($text): bool {
            $tokens = preg_split('/[^a-z0-9]+/', Str::lower($item['name'])) ?: [];
            return collect($tokens)->filter(fn (string $token): bool => strlen($token) > 2)
                ->contains(fn (string $token): bool => Str::contains($text, $token));
        });
        if ($product) {
            $stock = $product['stock'] > 0 ? "{$product['stock']} units stock-e ache" : 'ekhon out of stock';
            $description = $product['description'] ? " {$product['description']}" : '';
            return sprintf('%s er regular price ৳%.2f. %.0f%% discount er por selling price ৳%.2f. %s.%s', $product['name'], $product['price'], $product['discount_percent'], $product['discounted_price'], $stock, $description);
        }

        return null;
    }

    private function unavailableReply(): string
    {
        return 'I cannot access the general-answer service right now, but I can still help with products, prices, discounts, stock, delivery, payment, cancellation, and refund questions.';
    }
}
