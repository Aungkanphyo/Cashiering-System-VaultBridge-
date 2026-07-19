<?php

namespace App\Events;

use App\Http\Resources\Admin\VoucherResource;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SaleProcessed implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $voucher;
    public $updatedProducts;

    /**
     * Create a new event instance.
     */
    public function __construct($voucher, $products)
    {
        // Change the resource by dragging and dropping the relationships related to the voucher.
        $voucher->load(['salePayment', 'details.product']);
        $this->voucher = (new VoucherResource($voucher))->resolve();

        // Listing of reduced Product IDs and new Stock Quantity
        $this->updatedProducts = $products->map(function ($product) {
            return [
                'product_id' => $product->product_id,
                'stock_quantity' => $product->stock_quantity,
            ];
        })->values()->toArray();
    }

    // Setting up a private channel that only admins can listen to
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('admin.dashboard'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'SaleProcessed';
    }
}
