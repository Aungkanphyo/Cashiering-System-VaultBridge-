<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VoucherResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $subtotal = $this->details->sum('sub_total');
        $finalAmount = $this->details->sum('total');
        $totalDiscount = $subtotal - $finalAmount;

        return [
            'id' => (string) $this->voucher_id,
            'dateTime' => $this->sale_date->format('Y-m-d H:i:s'),
            'subtotal' => (float) $subtotal,
            'totalDiscount' => (float) $totalDiscount,
            'finalAmount' => (float) $finalAmount,
            'paidAmount' => (float) $this->payment_received,
            'changeAmount' => (float) $this->change,
            'paymentMethod' => $this->salePayment->payment_name ?? 'Cash',
            'status' => $this->status,
            'voidReason' => $this->void_reason ?? '',
            'items' => VoucherDetailResource::collection($this->details),
        ];
    }
}
