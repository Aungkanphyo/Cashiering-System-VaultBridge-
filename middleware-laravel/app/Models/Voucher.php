<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable([
    'session_id',
    'payment_id',
    'sale_date',    
    'status',
    'change',
    'payment_received',
    'void_reason',
    'voided_at',
])]
class Voucher extends Model
{
    use HasFactory;

    protected $table = 'vouchers';

    protected $primaryKey = 'voucher_id';

    protected $fillable = [
        'session_id',
        'payment_id',
        'sale_date',    
        'status',
        'change',
        'payment_received',
        'void_reason',
        'voided_at',
    ];

    protected $guarded = [];
    protected $casts = [
        'sale_date' => 'datetime',
        'voided_at' => 'datetime',
        'change' => 'decimal:2',
        'payment_received' => 'decimal:2',
    ];

    /**
              * Relationship: In which registration session was the voucher sold?
     */
    public function cashRegisterSession()
    {
        return $this->belongsTo(CashRegisterSession::class, 'session_id', 'session_id');
    }

    /**
          * Relationship: What Payment Type are you using?
     */
    public function salePayment()
    {
        return $this->belongsTo(SalePayment::class, 'payment_id', 'payment_id');
    }

    /**
          * Relationship: A voucher will contain many details of the purchased item.
     */
    public function details()
    {        
        return $this->hasMany(VoucherDetail::class, 'voucher_id', 'voucher_id');
    }
}