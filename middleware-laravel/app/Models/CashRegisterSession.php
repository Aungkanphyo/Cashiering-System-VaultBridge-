<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'user_id',
    'opening_time',
    'closing_time',
    'expected_closing_cash',
    'actual_closing_cash',
    'discrepancy',
    'report_text',
])]
class CashRegisterSession extends Model
{
    use HasFactory;
    protected $primaryKey = 'session_id';

    protected $casts = [
        'opening_time' => 'datetime',
        'closing_time' => 'datetime',
        'expected_closing_cash' => 'decimal:2',
        'actual_closing_cash' => 'decimal:2',
        'discrepancy' => 'decimal:2',
    ];

    // Relationship: Which user opened this session?
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    // Relationship: Vouchers sold during this session
    public function vouchers()
    {
        return $this->hasMany(Voucher::class, 'session_id', 'session_id');
    }
}
