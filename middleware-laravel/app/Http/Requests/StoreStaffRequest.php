<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreStaffRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() && $this->user()->role === 'admin';
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'username' => 'required|string|max:255',
            'password' => 'required|string|min:4',
            'email' => 'required|email|unique:users,email',
            'phone_number' => 'required|string',
            'gender' => 'required|string',
            'date_of_birth' => 'required|date',
            'role' => 'required|string',
            'nrc' => 'required|string',
            'address' => 'required|string',
            'join_date' => 'required|date',
            'status' => 'required|string',
        ];
    }
}
