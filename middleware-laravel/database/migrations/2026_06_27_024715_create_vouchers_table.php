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
        Schema::create('vouchers', function (Blueprint $table) {
            $table->id('voucher_id');
            // Foreign Keys
            $table->foreignId('session_id')->constrained('cash_register_sessions', 'session_id')->onDelete('cascade');
            $table->foreignId('payment_id')->constrained('sale_payments', 'payment_id')->onDelete('cascade');

            $table->dateTime('sale_date');
            $table->decimal('final_amount', 15, 2);
            $table->string('status');
            $table->text('void_reason')->nullable();
            $table->dateTime('voided_at')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vouchers');
    }
};
