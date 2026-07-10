<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VoucherDetailResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $itemSubTotal = (float) $this->sub_total;
        $itemTotal = (float) $this->total;

        $discountPercent = $itemSubTotal > 0 
            ? (($itemSubTotal - $itemTotal) / $itemSubTotal) * 100 
            : 0;

        return [
            'name' => $this->product->product_name ?? 'Unknown Product',
            'qty' => $this->quantity,
            'unitPrice' => (float) $this->unit_price,
            'discount' => round($discountPercent, 2),
            'subTotal' => $itemSubTotal,
            'subtotal' => $itemSubTotal,
        ];
    }
}
