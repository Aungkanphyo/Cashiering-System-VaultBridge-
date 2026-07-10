<?php

namespace App\Http\Requests\Sale;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreSaleRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'payment_id'         => 'required|exists:sale_payments,payment_id',
            'status'             => 'required|string|max:50',
            'payment_received'   => 'required|numeric|min:0',

            'items'              => 'required|array|min:1',
            'items.*.product_id' => 'required|integer',
            'items.*.quantity'   => 'required|integer|min:1',
        ];
    }

    public function messages(): array
    {
        return [
            'payment_id.exists' => 'The selected payment method is not available in the system.',
            'items.required'    => 'There are no products in your cart yet.',
            'items.*.quantity.min' => 'The quantity of products must be at least 1.',
        ];
    }
}
