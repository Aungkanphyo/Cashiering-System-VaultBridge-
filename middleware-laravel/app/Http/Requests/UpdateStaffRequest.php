<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateStaffRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() && $this->user()->role === 'admin';;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $staffId = $this->route('id');
        $eighteenYearsAgo = now()->subYears(18)->format('Y-m-d');

        return [
            'username' => 'required|string|max:255',
            // to exclude the email of the currently edited user_id when checking for unique
            'email' => 'required|email|unique:users,email,' . $staffId . ',user_id',
            'phone_number' => 'required|string|unique:users,phone_number',
            'gender' => 'required|string',
            'date_of_birth' => 'required|date|before_or_equal:' . $eighteenYearsAgo,
            'nrc' => 'required|string',
            'address' => 'required|string',
        ];
    }
}
