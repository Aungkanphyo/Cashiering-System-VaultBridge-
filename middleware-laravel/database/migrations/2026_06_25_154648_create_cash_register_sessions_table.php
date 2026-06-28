<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('cash_register_sessions', function (Blueprint $table) {
            $table->id('session_id');
            // Foreign key to users table
            $table->foreignId('user_id')->constrained('users', 'user_id')->onDelete('cascade');

            $table->dateTime('opening_time');
            $table->dateTime('closing_time')->nullable();
            $table->decimal('expected_closing_cash', 15, 2)->default(0);
            $table->decimal('actual_closing_cash', 15, 2)->nullable();
            $table->decimal('discrepancy', 15, 2)->nullable();
            $table->text('report_text')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cash_register_sessions');
    }
};
