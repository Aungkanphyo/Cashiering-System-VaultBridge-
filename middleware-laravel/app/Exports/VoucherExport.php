<?php

namespace App\Exports;

use App\Models\Voucher;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class VoucherExport implements FromQuery, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
{
    protected array $filters;
    private $rowNumber = 0;

    public function __construct(array $filters)
    {
        $this->filters = $filters;
    }

    public function query()
    {
        $query = Voucher::with(['salePayment', 'details']);

        if (!empty($this->filters['search_id'])) {
            $query->where('voucher_id', 'like', "%{$this->filters['search_id']}%");
        }

        if (!empty($this->filters['payment_method'])) {
            $query->whereHas('salePayment', function ($q) {
                $q->where('payment_name', $this->filters['payment_method']);
            });
        }

        if (!empty($this->filters['status'])) {
            $query->where('status', $this->filters['status']);
        }

        if (!empty($this->filters['from_date'])) {
            $query->whereDate('sale_date', '>=', $this->filters['from_date']);
        }
        if (!empty($this->filters['to_date'])) {
            $query->whereDate('sale_date', '<=', $this->filters['to_date']);
        }

        return $query->latest('sale_date');
    }

    public function map($voucher): array
    {
        $this->rowNumber++;

        $subtotal = (float) $voucher->details->sum('sub_total');
        $finalAmount = (float) $voucher->details->sum('total');
        $totalDiscount = $subtotal - $finalAmount;

        return [
            $this->rowNumber,
            '#' . $voucher->voucher_id,
            $voucher->sale_date->format('Y-m-d H:i:s'),
            number_format($subtotal) . ' Ks',
            number_format($totalDiscount) . ' Ks',
            number_format($finalAmount) . ' Ks',
            number_format((float) $voucher->payment_received) . ' Ks',
            number_format((float) $voucher->change) . ' Ks',
            $voucher->salePayment->payment_name ?? 'Cash',
            strtoupper($voucher->status),
            $voucher->void_reason ?? '-',
        ];
    }

    public function headings(): array
    {
        return [
            'No.',
            'Sale ID',
            'Date & Time',
            'Subtotal',
            'Discount',
            'Total Grand',
            'Paid Amount',
            'Change',
            'Payment Method',
            'Status',
            'Void Reason'
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => [
                'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '08694B'] // Frontend Table ခေါင်းစဉ်အရောင်အတိုင်း သုံးထားပါတယ်
                ]
            ],
        ];
    }
}
