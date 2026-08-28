<?php

it('stores a contact support message', function () {
    $response = $this->postJson('/api/contact', [
        'name' => 'Amina Rahman',
        'email' => 'amina@example.com',
        'message' => 'Please help me with my recent order.',
    ]);

    $response->assertCreated()
        ->assertJsonPath('success', true)
        ->assertJsonPath('message', 'Thank you for contacting us!');

    $this->assertDatabaseHas('messages', [
        'name' => 'Amina Rahman',
        'email' => 'amina@example.com',
        'message' => 'Please help me with my recent order.',
    ]);
});

it('validates required contact support fields', function () {
    $this->postJson('/api/contact', [])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['name', 'email', 'message']);
});
