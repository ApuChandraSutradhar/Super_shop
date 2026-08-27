<?php

use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request as HttpRequest;
use Illuminate\Support\Facades\Http;

uses(RefreshDatabase::class);

test('the assistant gives a complete database-backed product answer without calling Gemini', function () {
    config(['services.gemini.key' => 'test-key']);
    Product::query()->create([
        'name' => 'Fresh Red Apple', 'category' => 'Fruit', 'price' => 250,
        'stock' => 12, 'discount' => 10, 'description' => 'Crisp, sweet red apples.',
    ]);

    Http::fake();

    $this->postJson('/api/chat/assistant', ['message' => 'Fresh Red Apple ar discount o price koto?'])
        ->assertOk()
        ->assertJsonPath('reply', fn (string $reply): bool => str_contains($reply, '৳250.00')
            && str_contains($reply, '10%') && str_contains($reply, '৳225.00') && str_contains($reply, '12 units'));

    Http::assertNothingSent();
});

test('the assistant sends unknown conversational questions to Gemini with live store context', function () {
    config(['services.gemini.key' => 'test-key']);
    Product::query()->create([
        'name' => 'Fresh Red Apple', 'category' => 'Fruit', 'price' => 250,
        'stock' => 12, 'discount' => 10, 'description' => 'Crisp apples',
    ]);
    Http::fake(['generativelanguage.googleapis.com/*' => Http::response([
        'candidates' => [['content' => ['parts' => [['text' => 'That is a great question.']]]]],
    ])]);

    $this->postJson('/api/chat/assistant', ['message' => 'What makes a healthy breakfast?'])
        ->assertOk()->assertJson(['reply' => 'That is a great question.']);

    Http::assertSent(fn (HttpRequest $request): bool => str_contains($request->body(), 'Fresh Red Apple')
        && str_contains($request->body(), 'inside Dhaka') && str_contains($request->body(), 'What makes a healthy breakfast?'));
});

test('the assistant gives delivery facts when Gemini is unavailable', function () {
    config(['services.gemini.key' => 'test-key']);
    Http::fake();

    $this->postJson('/api/chat/assistant', ['message' => 'Delivery koto minute ar fee koto?'])
        ->assertOk()
        ->assertJsonPath('reply', fn (string $reply): bool => str_contains($reply, 'fixed delivery')
            && str_contains($reply, '৳60') && str_contains($reply, '৳120'));

    Http::assertNothingSent();
});

test('the assistant gives a friendly local greeting', function () {
    Http::fake();

    $this->postJson('/api/chat/assistant', ['message' => 'Hello, how are you?'])
        ->assertOk()
        ->assertJsonPath('reply', fn (string $reply): bool => str_starts_with($reply, 'Hello!'));

    Http::assertNothingSent();
});

test('the assistant answers Banglish how are you questions in Banglish', function () {
    Http::fake();

    $this->postJson('/api/chat/assistant', ['message' => 'Apni kamon achen?'])
        ->assertOk()
        ->assertJsonPath('reply', fn (string $reply): bool => str_contains($reply, 'Ami valo achi')
            && str_contains($reply, 'Apni kamon achen?'));

    Http::assertNothingSent();
});

test('the assistant welcomes a customer after they say thanks', function () {
    Http::fake();

    $this->postJson('/api/chat/assistant', ['message' => 'Thanks'])
        ->assertOk()
        ->assertJsonPath('reply', fn (string $reply): bool => str_contains($reply, 'most welcome')
            && str_contains($reply, 'more products and offers'));

    Http::assertNothingSent();
});

test('the assistant returns a useful safe reply when Gemini fails', function () {
    config(['services.gemini.key' => 'test-key']);
    Http::fake(['generativelanguage.googleapis.com/*' => Http::response(['error' => ['message' => 'Quota exceeded']], 429)]);

    $this->postJson('/api/chat/assistant', ['message' => 'Tell me a joke'])
        ->assertOk()
        ->assertJsonPath('reply', fn (string $reply): bool => str_contains($reply, 'products, prices'));
});

test('the assistant rejects an empty message', function () {
    $this->postJson('/api/chat/assistant', ['message' => ''])
        ->assertUnprocessable()->assertJsonValidationErrors('message');
});
