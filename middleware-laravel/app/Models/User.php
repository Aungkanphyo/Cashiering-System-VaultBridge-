<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

#[Fillable([
    'username',
    'password', 
    'role',
    'status',
    'phone_number',
    'nrc',
    'date_of_birth',
    'address',
    'gender',
    'email',
    'join_date',
    ])]
#[Hidden([
    'password',
    'remember_token'
    ])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    protected $primaryKey = 'user_id';

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'date_of_birth' => 'date',
            'join_date' => 'date',
        ];
    }

    public function cashRegisterSessions()
    {
        return $this->hasMany(CashRegisterSession::class, 'user_id', 'user_id');
    }

    // Relation: Retrieve all vouchers sold through the user
    public function vouchers()
    {
        return $this->hasManyThrough(
            Voucher::class, // Target Model you want to get
            CashRegisterSession::class, // Model of the medium to be traversed
            'user_id', // Foreign Key on the CashRegisterSession table
            'session_id', // Foreign Key on Voucher table
            'user_id', // Local Key on the User table
            'session_id' // Local Key on the CashRegisterSession table
        );
    }
}