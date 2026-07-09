<?php

namespace App\Http\Controllers;

use App\Models\SalePayment;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PaymentMethodController extends Controller
{
    // GET /api/payment-methods
    public function index()
    {
        return response()->json(SalePayment::orderBy('payment_id')->get());
    }

    // GET /api/payment-methods/{id}
    public function show($id)
    {
        $payment = SalePayment::findOrFail($id);

        return response()->json($payment);
    }

    // POST /api/payment-methods
    public function store(Request $request)
    {
        $data = $request->validate([
            'payment_name' => 'required|string|unique:sale_payments,payment_name',
            'status' => 'nullable|in:active,inactive',
        ]);

        $data['status'] = $data['status'] ?? 'active';

        $payment = SalePayment::create($data);

        return response()->json($payment, 201);
    }

    // PUT /api/payment-methods/{id}
    public function update(Request $request, $id)
    {
        $payment = SalePayment::findOrFail($id);

        $data = $request->validate([
            'payment_name' => [
                'sometimes', 'required', 'string',
                Rule::unique('sale_payments', 'payment_name')->ignore($payment->payment_id, 'payment_id'),
            ],
            'status' => 'sometimes|required|in:active,inactive',
        ]);

        $payment->fill($data);
        $payment->save();

        return response()->json($payment);
    }

    // DELETE /api/payment-methods/{id}
    public function destroy($id)
    {
        $payment = SalePayment::findOrFail($id);
        $payment->delete();

        return response()->json(['message' => 'Payment method deleted']);
    }
}