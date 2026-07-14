<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('users')->insert([
            [
                'username' => 'admin',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
                'status' => 'active',
                'phone_number' => '09123456789',
                'nrc' => '9/PaKaKha(N)123456',
                'date_of_birth' => '1995-01-01',
                'address' => 'Mandalay, Myanmar',
                'gender' => 'male',
                'email' => 'aungkanphyo.dev@gmail.com',
                'join_date' => Carbon::now()->toDateString(), // Today's date will be entered
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],

            [
                'username' => 'cashier1',
                'password' => Hash::make('cashier123'),
                'role' => 'cashier',
                'status' => 'active',
                'phone_number' => '09987654321',
                'nrc' => '9/PaKaKha(N)654321',
                'date_of_birth' => '1998-05-10',
                'address' => 'Mandalay, Myanmar',
                'gender' => 'female',
                'email' => 'phoenix798526456@gmail.com',
                'join_date' => Carbon::now()->toDateString(),
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],

            [
                'username' => 'cashier2',
                'password' => Hash::make('cashier456'),
                'role' => 'cashier',
                'status' => 'active',
                'phone_number' => '09456123789',
                'nrc' => '9/PaKaKha(N)132475',
                'date_of_birth' => '1998-08-30',
                'address' => 'Bago, Myanmar',
                'gender' => 'male',
                'email' => 'aungkanphyo1@gmail.com',
                'join_date' => Carbon::now()->toDateString(),
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]
        ]);
    }
}
