<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'category_id',
    'barcode',
    'product_name',
    'price',
    'stock_quantity',
    'min_stock_level',
    'sale_price',
    'discount_rate',
    'discount_price',
    'status',
])]
class Product extends Model
{
    use HasFactory;
    protected $primaryKey = 'product_id';

    protected $casts = [
        'price' => 'decimal:2',
        'sale_price' => 'decimal:2',
        'discount_rate' => 'decimal:2',
        'discount_price' => 'decimal:2',
        'stock_quantity' => 'integer',
        'min_stock_level' => 'integer',
    ];

    // Relationship: Product is under a Category
    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id', 'category_id');
    }

    // Relationship: A product can have multiple voucher details
    public function voucherDetails()
    {
        return $this->hasMany(VoucherDetail::class, 'product_id', 'product_id');
    }
}
