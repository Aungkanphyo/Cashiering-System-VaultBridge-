<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'payment_name',
    'status',
])]
class SalePayment extends Model
{
    use HasFactory;
    protected $primaryKey = 'payment_id';

    // Relationship: There can be many vouchers with one payment type
    public function vouchers()
    {
        return $this->hasMany(Voucher::class, 'payment_id', 'payment_id');
    }
}
