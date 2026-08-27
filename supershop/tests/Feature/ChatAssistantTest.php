<?php

use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request as HttpRequest;
use Illuminate\Support\Facades\Http;

uses(RefreshDatabase::class);

test('the assistant sends live catalog context to Gemini and returns its reply', function () {
    config(['services.gemini.key' => 'test-key']);

    Product::query()->create([
        'name' => 'Fresh Apples',
        'category' => 'Fruit',
        'price' => 250,
        'stock' => 12,
        'discount' => 10,
        'description' => 'Crisp apples',
    ]);

    Http::fake([
        'generativelanguage.googleapis.com/*' => Http::response([
            'candidates' => [[
                'content' => ['parts' => [['text' => 'Fresh Apples are in stock.']]],
            ]],
        ]),
    ]);

    $response = $this->postJson('/api/chat/assistant', ['message' => 'Do you have apples?']);

    $response->assertOk()->assertJson(['reply' => 'Fresh Apples are in stock.']);

    Http::assertSent(function (HttpRequest $request): bool {
        return str_contains($request->url(), 'models/gemini-3.6-flash:generateContent')
            && str_contains($request->body(), 'Fresh Apples')
            && str_contains($request->body(), 'User Question: Do you have apples?')
            && ! str_contains($request->body(), 'systemInstruction');
    });
});

test('the assistant reports a missing Gemini API key without a service unavailable response', function () {
    putenv('GEMINI_API_KEY=');
    $_ENV['GEMINI_API_KEY'] = '';
    $_SERVER['GEMINI_API_KEY'] = '';
    config(['services.gemini.key' => null]);

    $this->postJson('/api/chat/assistant', ['message' => 'Apple ar price koto?'])
        ->assertOk()
        ->assertJson(['reply' => 'Gemini API Key is missing in .env']);
});

test('the assistant returns a useful response when Gemini rejects the request', function () {
    config(['services.gemini.key' => 'test-key']);

    Http::fake([
        'generativelanguage.googleapis.com/*' => Http::response([
            'error' => ['message' => 'The requested model was not found.'],
        ], 404),
    ]);

    $this->postJson('/api/chat/assistant', ['message' => 'Apple ar price koto?'])
        ->assertOk()
        ->assertJson(['reply' => 'Sorry, I am currently having trouble connecting to Gemini API.']);
});

test('the assistant rejects an empty message', function () {
    $this->postJson('/api/chat/assistant', ['message' => ''])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('message');
});
