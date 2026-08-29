<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'category',
        'price',
        'discount',
        'stock',
        'description',
        'image'
    ];

    public function feedbacks()
    {
        return $this->hasMany(Feedback::class, 'product_id', 'id');
    }
}
