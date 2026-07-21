<?php
namespace App\Http\Controllers\Sale;

use App\Events\SaleProcessed;
use App\Http\Controllers\Controller;
use App\Http\Requests\Sale\StoreSaleRequest;
use App\Models\CashRegisterSession;
use App\Models\Product;
use App\Models\Voucher;
use App\Models\VoucherDetail;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SaleController extends Controller
{
    public function index(): JsonResponse
    {
        try {
            $products = Product::with('category')->get();

            return response()->json($products, 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'catching data error ...',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store a newly created sale/voucher in storage.
     */
    public function store(StoreSaleRequest $request): JsonResponse
    {
        $user = $request->user();

        $activeSession = CashRegisterSession::where('user_id', $user->user_id)
            ->whereNull('closing_time')
            ->first();

        if (! $activeSession) {
            return response()->json([
                'message' => 'Sales are not yet open. Please enable the cashier system first.',
            ], 400);
        }

        $validated = $request->validated();

        DB::beginTransaction();

        try {
            $productIds = collect($validated['items'])->pluck('product_id')->toArray();
            $products   = Product::whereIn('product_id', $productIds)->get()->keyBy('product_id');

            $totalAmount        = 0;
            $voucherDetailsData = [];

            foreach ($validated['items'] as $item) {
                $product = $products->get($item['product_id']);

                if (! $product) {
                    throw new \Exception("Product ID {$item['product_id']} not found.");
                }

                if ($product->stock_quantity < $item['quantity']) {
                    throw new \Exception("Insufficient stock for \"{$product->product_name}\". Available: {$product->stock_quantity}.");
                }

                $unitPrice   = $product->price;
                $discountPercent = $product->discount_percent ?? $product->discount_rate ?? 0;
                $discountAmount  = ($unitPrice * $discountPercent) / 100;
                $finalItemPrice  = $unitPrice - $discountAmount;

                $subTotal    = $unitPrice * $item['quantity'];
                $itemTotal   = $finalItemPrice * $item['quantity'];
                $totalAmount += $itemTotal;

                $voucherDetailsData[] = [
                    'product_id' => $item['product_id'],
                    'quantity'   => $item['quantity'],
                    'unit_price' => $unitPrice,
                    'sub_total'  => $subTotal,
                    'total'      => $itemTotal,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];

                $product->decrement('stock_quantity', $item['quantity']);
            }

            $paymentReceived = $validated['payment_received'];
            $change          = $paymentReceived - $totalAmount;

            $voucher = Voucher::create([
                'session_id'       => $activeSession->session_id,
                'payment_id'       => $validated['payment_id'],
                'sale_date'        => now(),
                'status'           => $validated['status'],
                'change'           => $change >= 0 ? $change : 0, // Preventing negative
                'payment_received' => $paymentReceived,
            ]);

            foreach ($voucherDetailsData as &$detail) {
                $detail['voucher_id'] = $voucher->voucher_id;
            }

            VoucherDetail::insert($voucherDetailsData);

            DB::commit();

            event(new SaleProcessed($voucher, $products));

            return response()->json([
                'message'    => 'Sale created successfully.',
                'voucher_id' => $voucher->voucher_id,
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Sale Store Error: ' . $e->getMessage(), [
                'user_id'      => $user->id,
                'request_data' => $request->all(),
            ]);

            return response()->json([
                'message' => 'There is an internal server error. Please wait a moment and try again.',
            ], 500);
        }
    }

    public function getNextVoucherId(): JsonResponse
    {
        try {
            $maxId  = Voucher::max('voucher_id') ?? Voucher::max('id') ?? 1000;
            $nextId = $maxId + 1;

            return response()->json([
                'success'         => true,
                'next_voucher_id' => $nextId,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching next voucher ID: ' . $e->getMessage(),
            ], 500);
        }
    }
}