import { useEffect, useState } from "react";
import { TriangleAlert } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axios";

export default function History() {
    const [salesData, setSalesData] = useState([]);
    const [loading, setLoading] = useState(true);

    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const [lastPage, setLastPage] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);

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

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const response = await api.get("/vouchers", {
                params: {page,per_page: rowsPerPage,},
            });

            setSalesData(response.data.data);
            setLastPage(response.data.last_page);
            setTotalRecords(response.data.total);

        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message ??"Unable to load voucher history");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [page, rowsPerPage]);

    const voidVoucher = async () => {
        if (!saleToDelete) return;

        try {
            await api.post(`/vouchers/${saleToDelete.voucher_id}/void`,{void_reason: selectedReason,});
            toast.success("Voucher voided successfully");
            setSaleToDelete(null);
            setSelectedReason("");
            fetchHistory();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message ??"Unable to void voucher");
        }

    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                Loading...
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <div className="overflow-hidden rounded-2xl border border-green-100 bg-white shadow">
                {/* Header */}
                <div className="flex flex-col gap-4 border-b bg-slate-50 px-6 py-4 md:flex-row md:items-center md:justify-between">
                    <h2 className="text-xl font-bold text-slate-700">Sales History List</h2>
                    <div className="flex items-center gap-2">
                        <span className="text-sm">Show</span>

                        <select value={rowsPerPage} className="rounded-lg border px-3 py-2"
                            onChange={(e) => {
                                setRowsPerPage(Number(e.target.value));
                                setPage(1);
                            }}>
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={15}>15</option>
                            <option value={20}>20</option>
                            <option value={25}>25</option>
                        </select>

                        <span className="text-sm">records</span>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-4 text-left">ID</th>
                                <th className="px-6 py-4 text-left">Date</th>
                                <th className="px-6 py-4 text-left">Total</th>
                                <th className="px-6 py-4 text-left">Discount </th>
                                <th className="px-6 py-4 text-left">Grand Total</th>
                                <th className="px-6 py-4 text-left">Payment</th>
                                <th className="px-6 py-4 text-left">Status</th>
                                <th className="px-6 py-4 text-left">Action</th>
                            </tr>
                        </thead>
                       
                        <tbody className="text-sm font-semibold text-black">
                            {salesData.map((sale) => (
                                <tr key={sale.voucher_id} className={`border-t hover:bg-slate-50`}>

                                    <td className="px-6 py-5 font-bold">#{sale.voucher_id}</td>
                                    <td className="px-6 py-5 whitespace-nowrap">{new Date(sale.sale_date).toLocaleString("sv-SE", {timeZone: "Asia/Yangon",})}</td>
                                    <td className="px-6 py-5">{Number(sale.total).toLocaleString()}</td>
                                    <td className="px-6 py-5 text-red-500">{sale.discount > 0 ? "-" : "" }{Number(sale.discount).toLocaleString()}</td>
                                    <td className="px-6 py-5">{Number(sale.grand_total).toLocaleString()}</td>
                                    <td className="px-6 py-5">
                                        <span className={sale.payment === "cash" ? "text-yellow-500" : "text-blue-500"}>{sale.payment}</span>
                                    </td>

                                    <td className="px-6 py-5">
                                        <span className={sale.status === "voided" ? "text-red-600" : "text-green-600"}>{sale.status}</span>
                                    </td>

                                    <td className="px-6 py-5">
                                        {sale.status === "voided" ? 
                                            (<span className="block max-w-[220px] truncate text-slate-400" title={sale.void_reason}>{sale.void_reason}</span>) : 
                                            (<button onClick={() => setSaleToDelete(sale)} className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"> Void</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {saleToDelete && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                            <div className="w-full max-w-xl rounded-3xl bg-white shadow-2xl">
                                <div className="flex items-center justify-between border-b px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-full bg-red-100 p-3">
                                            <TriangleAlert className="text-red-600" />
                                        </div>

                                        <div>
                                            <h2 className="text-xl font-bold text-red-600">Void Voucher</h2>
                                            <p className="text-sm text-gray-500">Voucher #{saleToDelete.voucher_id}</p>
                                        </div>
                                    </div>

                                    <button onClick={() => {setSaleToDelete(null);setSelectedReason("");}} className="text-2xl text-gray-400 hover:text-black">×</button>
                                </div>

                                <div className="space-y-6 p-8">
                                    <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                                        Voiding this voucher will restore product stock.
                                    </div>

                                    <div>
                                        <label className="mb-2 block font-semibold">Void Reason</label>
                                        <select value={selectedReason} className="w-full rounded-xl border px-4 py-3" onChange={(e) =>setSelectedReason(e.target.value)}>
                                            <option value="">Select reason...</option>

                                            {voidReasons.map((reason) => (
                                                <option key={reason} value={reason}>{reason}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex justify-end gap-3">
                                        <button onClick={() => { setSaleToDelete(null); setSelectedReason("");}} className="rounded-xl bg-gray-200 px-6 py-3">
                                            Cancel
                                        </button>

                                        <button disabled={!selectedReason} onClick={voidVoucher} className="rounded-xl bg-red-600 px-6 py-3 text-white disabled:opacity-40">
                                            Void Voucher
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex flex-col gap-4 border-t px-6 py-4 md:flex-row md:items-center md:justify-between">
                    <div className="text-sm text-gray-600">
                        Showing{" "}
                        <span className="font-semibold">{totalRecords === 0 ? 0 : (page - 1) * rowsPerPage + 1}</span>{" "}
                        -{" "}
                        <span className="font-semibold">{Math.min(page * rowsPerPage, totalRecords)}</span>{" "}
                        of{" "}
                        <span className="font-semibold">{totalRecords}</span>{" "}
                        records
                    </div>

                    <div className="flex items-center gap-2">
                        <button disabled={page === 1} onClick={() => setPage(page - 1)} className="rounded-lg border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-40">
                            Previous
                        </button>

                        {Array.from(
                            { length: lastPage },
                            (_, index) => (
                                <button key={index} onClick={() => setPage(index + 1)}
                                    className={`h-10 w-10 rounded-lg transition ${page === index + 1 ? "bg-green-600 text-white" : "border hover:bg-slate-100"}`}>
                                    {index + 1}
                                </button>
                            )
                        )}

                        <button disabled={page === lastPage} onClick={() => setPage(page + 1)} className="rounded-lg border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-40">
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}