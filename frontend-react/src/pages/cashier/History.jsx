import { useMemo, useState } from "react";
import { TriangleAlert } from "lucide-react";
const salesData = [
    {
        id: 6002,
        date: "2026-06-07 11:30:10",
        total: 41000,
        discount: -1000,
        grandTotal: 40000,
        payments: [{ type: "KPay" }],
        status: "COMPLETED",
    },
    {
        id: 6001,
        date: "2026-06-07 09:15:30",
        total: 24000,
        discount: 0,
        grandTotal: 24000,
        payments: [{ type: "Cash" }],
        status: "VOIDED",
        report:
            "Customer requested cancellation because of duplicate payment.",
    },

    ...Array.from({ length: 15 }, (_, i) => ({
        id: 6000 - i,
        date: "2026-06-06 10:00:00",
        total: 30000,
        discount: -1000,
        grandTotal: 29000,
        payments: [{ type: "Cash" }],
        status: "COMPLETED",
    })),
];

export default function History() {
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [saleToDelete, setSaleToDelete] = useState(null);
    const [selectedReason, setSelectedReason] = useState("");

    const voidReasons = [
        "Customer Wants Less Qty",
        "Wrong Item Selected",
        "Cashier Error",
        "Insufficient Funds",
        "Payment Method Failed",
        "Test Transaction",
    ];

    const totalPages = Math.ceil(salesData.length / rowsPerPage);
    const currentData = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        return salesData.slice(start, start + rowsPerPage);
    }, [page, rowsPerPage]);

    return (
        <div className="min-h-screen">
            <div className="overflow-hidden rounded-2xl border border-green-100 bg-white shadow">

                {/* Header */}
                <div className="flex flex-col gap-4 border-b bg-slate-50 px-6 py-4 md:flex-row md:items-center md:justify-between">
                    <h2 className="text-xl font-bold text-slate-700">Sales History List</h2>

                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Show</span>

                        <select value={rowsPerPage}
                            onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(1); }}
                            className="rounded-lg border px-3 py-2 focus:outline-none focus:border-green-600">
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={15}>15</option>
                            <option value={20}>20</option>
                            <option value={25}>25</option>
                        </select>

                        <span className="text-sm text-gray-600 mx-2">records</span>
                    </div>
                </div>

                {/* Table */}

                <div className="overflow-x-auto">
                    <table className="w-full">

                        <thead className="bg-slate-50 text-gray-700">
                            <tr>
                                <th className="px-6 py-4 text-left">ID</th>
                                <th className="px-6 py-4 text-left">Date & Time</th>
                                <th className="px-6 py-4 text-left">Total</th>
                                <th className="px-6 py-4 text-left">Discount</th>
                                <th className="px-6 py-4 text-left">Grand Total</th>
                                <th className="px-6 py-4 text-left">Payment</th>
                                <th className="px-6 py-4 text-left">Status</th>
                                <th className="px-6 py-4 text-left">Action</th>
                            </tr>
                        </thead>

                        <tbody className="text-sm font-semibold text-slate-600">
                            {currentData.map((sale) => (
                                <tr
                                    key={sale.id} className={`border-t hover:bg-slate-50 ${sale.status === "VOIDED" ? "bg-slate-100 text-slate-400 line-through" : ""}`}
                                >
                                    <td className="px-6 py-5 font-bold">#{sale.id}</td>
                                    <td className="px-6 py-5 whitespace-nowrap">{sale.date}</td>
                                    <td className="px-6 py-5">{sale.total.toLocaleString()} </td>
                                    <td className="px-6 py-5 text-red-500">{sale.discount.toLocaleString()}</td>
                                    <td className="px-6 py-5">{sale.grandTotal.toLocaleString()}</td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-wrap gap-2">
                                            {sale.payments.map((payment, index) => (
                                                <span key={index} className={payment.type === "Cash" ? "text-yellow-500" : "text-blue-500"}>
                                                    {payment.type}
                                                </span>
                                            ))}
                                        </div>
                                    </td>

                                    <td className="px-6 py-5">
                                        <span className={sale.status === "VOIDED" ? "text-red-500" : "text-green-600"}>{sale.status}</span>
                                    </td>

                                    <td className="px-6 py-5">
                                        {sale.status === "VOIDED" ?
                                            (<span className="block max-w-[180px] truncate text-slate-400" title={sale.report}>{sale.report}</span>) :
                                            (<button onClick={() => setSaleToDelete(sale)}
                                                className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600">
                                                Delete
                                            </button>)
                                        }
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Delete Modal */}
                {saleToDelete && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                        <div className="w-full max-w-xl rounded-3xl bg-white shadow-2xl">

                            {/* Header */}
                            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-100">
                                        <TriangleAlert className="h-6 w-6 text-red-600" />
                                    </div>

                                    <div>
                                        <h2 className="text-xl font-bold text-red-600">
                                            Void Voucher
                                        </h2>
                                        
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        setSaleToDelete(null);
                                        setSelectedReason("");
                                    }}
                                    className="flex h-10 w-10 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Body */}
                            <div className="space-y-6 p-8">

                                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                                    <p>
                                        Voiding this voucher will restore the stock quantity.
                                        Please choose a reason before continuing.
                                    </p>
                                </div>

                                <div>
                                    <label className="mb-2 block font-semibold text-gray-700">
                                        Reason
                                    </label>

                                    <select
                                        value={selectedReason}
                                        onChange={(e) => setSelectedReason(e.target.value)}
                                        className="w-full rounded-xl border-2 border-red-300 px-4 py-3 outline-none focus:border-red-500"
                                    >
                                        <option value="">Select a reason...</option>

                                        {voidReasons.map((reason) => (
                                            <option key={reason} value={reason}>
                                                {reason}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex justify-end gap-3">

                                    <button
                                        onClick={() => {
                                            setSaleToDelete(null);
                                            setSelectedReason("");
                                        }}
                                        className="rounded-xl bg-gray-200 px-6 py-3 font-semibold hover:bg-gray-300"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        disabled={!selectedReason}
                                        onClick={() => {
                                            // Save selected reason
                                            saleToDelete.report = selectedReason;

                                            // Call API here

                                            setSaleToDelete(null);
                                            setSelectedReason("");
                                        }}
                                        className="rounded-xl bg-red-600 px-6 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 hover:bg-red-700"
                                    >
                                        Void Voucher
                                    </button>

                                </div>

                            </div>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="flex flex-col gap-4 border-t px-6 py-4 md:flex-row md:items-center md:justify-between">
                    <div className="text-sm text-gray-600">Showing{" "}
                        <span className="font-semibold">{(page - 1) * rowsPerPage + 1}</span>{" "}-
                        <span className="font-semibold">{" "}{Math.min(page * rowsPerPage, salesData.length)}</span>{" "}of{" "}
                        <span className="font-semibold">{salesData.length}</span>{" "}records
                    </div>

                    <div className="flex items-center gap-2">
                        <button disabled={page === 1}
                            onClick={() => setPage((p) => p - 1)}
                            className="rounded-lg border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-40"
                        >Previous</button>

                        {Array.from({ length: totalPages }).map((_, index) => (
                            <button
                                key={index} onClick={() => setPage(index + 1)}
                                className={`h-10 w-10 rounded-lg transition ${page === index + 1 ? "bg-green-600 text-white" : "border hover:bg-slate-100"}`}
                            >
                                {index + 1}
                            </button>
                        ))}

                        <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}
                            className="rounded-lg border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}