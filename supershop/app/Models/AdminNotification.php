<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdminNotification extends Model
{
    protected $fillable = ['delivery_rider_id', 'type', 'title', 'message', 'link', 'is_read', 'read_at', 'data'];

    protected function casts(): array
    {
        return ['is_read' => 'boolean', 'read_at' => 'datetime', 'data' => 'array'];
    }

    public static function record(string $type, string $title, string $message, ?string $link = null, array $data = [], ?int $deliveryRiderId = null): self
    {
        return static::create(compact('type', 'title', 'message', 'link', 'data') + ['delivery_rider_id' => $deliveryRiderId]);
    }
}
