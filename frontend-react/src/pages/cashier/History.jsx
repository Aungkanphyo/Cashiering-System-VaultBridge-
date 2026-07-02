import { useMemo, useState } from "react";

const salesData = [
    {
        id: 6002,
        date: "2026-06-07 11:30:10",
        total: 41000,
        discount: -1000,
        grandTotal: 40000,
        payments: [{ type: "KPay"},],
        status: "COMPLETED",
    },
    {
        id: 6001,
        date: "2026-06-07 09:15:30",
        total: 24000,
        discount: 0,
        grandTotal: 24000,
        payments: [{ type: "Cash"}],
        status: "VOIDED",
        report: "Customer requested cancellation because of duplicate payment."
    },

    // Dummy rows
    ...Array.from({ length: 15 }, (_, i) => ({
        id: 6000 - i,
        date: "2026-06-06 10:00:00",
        total: 30000,
        discount: -1000,
        grandTotal: 29000,
        payments: [{ type: "Cash"}],
        status: "COMPLETED",
    })),
];

const ROWS_PER_PAGE = 5;

export default function History() {
    const [page, setPage] = useState(1);
    const [saleToDelete, setSaleToDelete] = useState(null);

    const totalPages = Math.ceil(salesData.length / ROWS_PER_PAGE);

    const currentData = useMemo(() => {
        const start = (page - 1) * ROWS_PER_PAGE;
        return salesData.slice(start, start + ROWS_PER_PAGE);
    }, [page]);

    return (
        <div className="min-h-screen">
            <div className="overflow-hidden rounded-2xl border border-green-100 bg-white shadow">
                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 text-md text-gray-700">
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

                        <tbody className="text-sm text-slate-600 font-semibold">
                            {currentData.map((sale) => (
                                <tr
                                    key={sale.id}
                                    className={`border-t transition hover:bg-slate-50 
                                        ${sale.status === "VOIDED" ? "line-through text-slate-400 bg-slate-100" : ""}`}
                                >
                                    <td className="px-6 py-5 font-bold">#{sale.id}</td>
                                    <td className="px-6 py-5 whitespace-nowrap">{sale.date}</td>
                                    <td className="px-6 py-5 ">{sale.total.toLocaleString()}</td>
                                    <td className="px-6 py-5 text-red-500">{sale.discount.toLocaleString()}</td>
                                    <td className="px-6 py-5 ">{sale.grandTotal.toLocaleString()}</td>
                                    <td className="px-6 py-5 ">
                                        <div className="flex flex-wrap gap-2">
                                            {sale.payments.map((payment, index) => (
                                                <span
                                                    key={index}
                                                    className={` ${payment.type === "Cash" ? "text-yellow-400" : "text-blue-400" }`}
                                                >
                                                    {payment.type}
                                                </span>
                                            ))}
                                        </div>
                                    </td>

                                    <td className="px-6 py-5">
                                        {sale.status === "VOIDED" ? (
                                            <span className=" text-red-400">{sale.status}</span>
                                        ) : (
                                            <span className=" text-green-600">{sale.status}</span>
                                        )}
                                    </td>

                                    <td className="px-6 py-5">
                                        {sale.status === "VOIDED" ? (
                                            <span className="block max-w-[180px] py-2 truncate font-medium text-slate-400"
                                                title={sale.report}
                                            >
                                                {sale.report}
                                            </span>
                                        ) : (
                                            <button onClick={() => setSaleToDelete(sale)}
                                                className="rounded-lg bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-400"
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                {/* Delete Confirmation Modal */}
                {saleToDelete && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                        <div className="w-96 rounded-xl bg-white p-6 shadow-xl">
                            <h2 className="text-lg font-semibold text-center text-gray-800">Confirm Delete</h2>

                            <p className="mt-3 text-sm text-gray-800">
                                Are you sure you want to delete sale{" "}
                                <span className="font-semibold">#{saleToDelete.id}</span> ?
                            </p>

                            <div className="mt-6 flex justify-end gap-3">
                                <button onClick={() => setSaleToDelete(null)}
                                    className="rounded-lg bg-gray-700 px-4 py-2 text-white hover:bg-gray-500"
                                >
                                    Cancel
                                </button>

                                <button onClick={() => setSaleToDelete(null)}
                                    className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Pagination */}
                <div className="flex items-center justify-between border-t px-6 py-4">
                    <button onClick={() => setPage((p) => p - 1)} disabled={page === 1}
                        className="rounded-lg border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Previous
                    </button>

                    <div className="flex gap-2">
                        {Array.from({ length: totalPages }).map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setPage(index + 1)}
                                className={`h-10 w-10 rounded-lg  transition ${page === index + 1 ? "bg-blue-600 text-white" : "border hover:bg-slate-100"}`}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>

                    <button onClick={() => setPage((p) => p + 1)} disabled={page === totalPages}
                        className="rounded-lg border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}