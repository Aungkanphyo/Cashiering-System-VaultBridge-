<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'category_name',
    'tax',
    'discount_category',
])]
class Category extends Model
{
    use HasFactory;
    protected $primaryKey = 'category_id';

    protected $casts = [
        'tax' => 'decimal:2',
    ];

    // Relationship: There can be many products under one category
    public function products()
    {
        return $this->hasMany(Product::class, 'category_id', 'category_id');
    }
}
