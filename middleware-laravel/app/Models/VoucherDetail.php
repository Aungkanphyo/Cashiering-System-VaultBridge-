<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'voucher_id',
    'product_id',
    'quantity',
    'sub_total',
    'unit_price',
    'change',
    'payment_received',
    'total_discount',
    'total',
])]
class VoucherDetail extends Model
{
    use HasFactory;
    protected $primaryKey = 'voucher_details_id';

    protected $casts = [
        'quantity' => 'integer',
        'sub_total' => 'decimal:2',
        'unit_price' => 'decimal:2',
        'change' => 'decimal:2',
        'payment_received' => 'decimal:2',
        'total_discount' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    // Relationship: Which voucher does this detail belong to?
    public function voucher()
    {
        return $this->belongsTo(Voucher::class, 'voucher_id', 'voucher_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id', 'product_id');
    } 
}
