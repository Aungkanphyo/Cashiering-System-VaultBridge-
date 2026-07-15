import { useEffect, useState } from "react";
import {
    TriangleAlert,
    Loader2,
    X,
    ChevronDown,
    ListFilter,
    Wallet,
    Search,
    RotateCcw,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axios";
import Pagination from "../../components/common/Pagination";

export default function History() {
    const [salesData, setSalesData] = useState([]);
    const [loading, setLoading] = useState(true);

    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    // Filter state
    const [statusFilter, setStatusFilter] = useState("");
    const [paymentFilter, setPaymentFilter] = useState("");
    const [paymentMethods, setPaymentMethods] = useState([]); // e.g. cash, kpay, aya — loaded from sale_payment table
    const [voucherIdInput, setVoucherIdInput] = useState(""); // raw text box value
    const [voucherIdFilter, setVoucherIdFilter] = useState(""); // debounced value used in the request

    const [lastPage, setLastPage] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);

    const [saleToDelete, setSaleToDelete] = useState(null);
    const [selectedReason, setSelectedReason] = useState("");
    const [voiding, setVoiding] = useState(false);

    const voidReasons = [
        "Customer Wants Less Qty",
        "Wrong Item Selected",
        "Cashier Error",
        "Insufficient Funds",
        "Payment Method Failed",
        "Test Transaction",
    ];

    const hasActiveFilters = Boolean(statusFilter || paymentFilter || voucherIdFilter);

    // Debounce the voucher ID search box so we don't fire a request on every keystroke
    useEffect(() => {
        const timer = setTimeout(() => {
            setVoucherIdFilter(voucherIdInput.trim());
            setPage(1);
        }, 400);
        return () => clearTimeout(timer);
    }, [voucherIdInput]);

    // Load the real list of payment methods (cash, kpay, aya, ...) for the filter dropdown
    useEffect(() => {
        const fetchPaymentMethods = async () => {
            try {
                const response = await api.get("/vouchers/payment-methods");
                setPaymentMethods(response.data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchPaymentMethods();
    }, []);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const response = await api.get("/vouchers", {
                params: {
                    page,
                    per_page: rowsPerPage,
                    status: statusFilter || undefined,
                    payment: paymentFilter || undefined,
                    voucher_id: voucherIdFilter || undefined,
                },
            });

            setSalesData(response.data.data);
            setLastPage(response.data.last_page);
            setTotalRecords(response.data.total);
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message ?? "Unable to load voucher history");
        } finally {
            setLoading(false);
        }
    };

    // Re-fetch data when filters or pagination change
    useEffect(() => {
        fetchHistory();
    }, [page, rowsPerPage, statusFilter, paymentFilter, voucherIdFilter]);

    const clearFilters = () => {
        setStatusFilter("");
        setPaymentFilter("");
        setVoucherIdInput("");
        setVoucherIdFilter("");
        setPage(1);
    };

    const handleCancelVoid = () => {
        if (voiding) return;
        setSaleToDelete(null);
        setSelectedReason("");
    };

    const voidVoucher = async () => {
        if (!saleToDelete) return;

        setVoiding(true);
        try {
            await api.post(`/vouchers/${saleToDelete.voucher_id}/void`, { void_reason: selectedReason });
            toast.success("Voucher voided successfully");
            setSaleToDelete(null);
            setSelectedReason("");
            fetchHistory();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message ?? "Unable to void voucher");
        } finally {
            setVoiding(false);
        }
    };

    // Shared styling for the pill-style filter selects — border/background flips to
    // emerald when that filter is actively narrowing the results.
   const selectClass = (active) =>
    `appearance-none pl-8 pr-8 py-2 rounded-lg border border-slate-400 text-xs font-semibold cursor-pointer transition-colors focus:outline-none focus:ring-4 focus:ring-emerald-500/15 ${
        active
            ? " text-emerald-700"
            : "bg-white text-slate-600 hover:border-slate-500"
    }`;
    return (
        <div className="min-h-screen">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Header */}
                <div className="flex flex-col gap-4 p-6 pb-4 lg:flex-row lg:items-center lg:justify-between">
                    <h2 className="text-xl font-bold text-slate-800">Sales History</h2>

                    {/* Controls & Dropdowns Wrapper */}
                    <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500">
                        {/* Voucher ID Search */}
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            <input
                                type="text"
                                value={voucherIdInput}
                                onChange={(e) => setVoucherIdInput(e.target.value)}
                                placeholder="Voucher ID"
                                className={`w-60 pl-8 pr-3 py-2 rounded-lg border text-xs font-semibold transition-colors focus:outline-none focus:ring-4 focus:ring-emerald-500/15 ${voucherIdFilter
                                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                                        : "border-slate-400 bg-white text-slate-600 hover:border-emerald-300"
                                    }`}
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="relative">
                            <ListFilter className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            <select
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    setPage(1);
                                }}
                                className={selectClass(Boolean(statusFilter))}
                            >
                                <option value="">All Statuses</option>
                                <option value="completed">Completed</option>
                                <option value="voided">Voided</option>
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        </div>

                        {/* Payment Filter */}
                        <div className="relative">
                            <Wallet className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            <select
                                value={paymentFilter}
                                onChange={(e) => {
                                    setPaymentFilter(e.target.value);
                                    setPage(1);
                                }}
                                className={selectClass(Boolean(paymentFilter))}
                            >
                                <option value="">All Payments</option>
                                {paymentMethods.map((method) => (
                                    <option key={method} value={method}>
                                        {method}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        </div>

                        <button
                            type="button"
                            onClick={clearFilters}
                            disabled={!hasActiveFilters}
                            className={`flex items-center gap-1 px-3 py-2 rounded-lg border text-xs font-semibold transition-colors ${hasActiveFilters
                                    ? "border-slate-200 bg-white text-slate-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 cursor-pointer"
                                    : "border-slate-200 bg-slate-50 text-slate-300 cursor-not-allowed"
                                }`}
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Clear
                        </button>

                        {/* Rows Per Page */}
                        <div className="flex items-center gap-1.5 whitespace-nowrap lg:ml-2">
                            <span>Show</span>
                            <div className="relative">
                                <select
                                    value={rowsPerPage}
                                    onChange={(e) => {
                                        setRowsPerPage(Number(e.target.value));
                                        setPage(1);
                                    }}
                                    className="appearance-none pl-3 pr-7 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:border-emerald-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/15 cursor-pointer transition-colors"
                                >
                                    {[5, 10, 15, 20, 25].map((n) => (
                                        <option key={n} value={n}>
                                            {n}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            </div>
                            <span>records</span>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-emerald-700 border-b border-emerald-800 text-white text-xs font-semibold uppercase">
                                <th className="p-4">ID</th>
                                <th className="p-4">Date</th>
                                <th className="p-4">Total</th>
                                <th className="p-4">Discount</th>
                                <th className="p-4">Grand Total</th>
                                <th className="p-4">Payment</th>
                                <th className="p-4 w-28">Status</th>
                                <th className="p-4 text-center">Action</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100 text-sm">
                            {loading && (
                                <tr>
                                    <td colSpan={8} className="p-8 text-center text-slate-400">
                                        <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
                                        Loading sales history...
                                    </td>
                                </tr>
                            )}
                            {!loading && salesData.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="p-8 text-center text-slate-400">
                                        No sales records found.
                                    </td>
                                </tr>
                            )}
                            {!loading &&
                                salesData.map((sale) => {
                                    const isVoided = sale.status === "voided";
                                    return (
                                        <tr
                                            key={sale.voucher_id}
                                            className={`hover:bg-slate-50 transition ${isVoided ? "bg-slate-100/50 opacity-75" : ""
                                                }`}
                                        >
                                            <td className="p-4 font-mono text-xs text-slate-500">
                                                #{sale.voucher_id}
                                            </td>
                                            <td className="p-4 whitespace-nowrap text-slate-600">
                                                {new Date(sale.sale_date).toLocaleString("sv-SE", {
                                                    timeZone: "Asia/Yangon",
                                                })}
                                            </td>
                                            <td className="p-4 font-semibold text-slate-800">
                                                {Number(sale.total).toLocaleString()}Ks
                                            </td>
                                            <td className="p-4 text-rose-600 font-semibold">
                                                {sale.discount > 0 ? "-" : ""}
                                                {Number(sale.discount).toLocaleString()}Ks
                                            </td>
                                            <td className="p-4 font-semibold text-emerald-700">
                                                {Number(sale.grand_total).toLocaleString()}Ks
                                            </td>
                                            <td className="p-4">
                                                <span
                                                    className={`font-semibold ${sale.payment === "cash" ? "text-amber-600" : "text-sky-600"
                                                        }`}
                                                >
                                                    {sale.payment}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span
                                                    className={`px-2.5 py-1 rounded-full text-xs font-semibold ${isVoided ? "text-red-500" : "text-emerald-600"
                                                        }`}
                                                >
                                                    {sale.status}
                                                </span>
                                            </td>
                                            {/* Centered Action Column */}
                                            <td className="p-4 text-center">
                                                <div className="flex justify-center items-center h-full">
                                                    {isVoided ? (
                                                        <span
                                                            className="block max-w-[220px] truncate text-xs text-slate-400 mx-auto"
                                                            title={sale.void_reason}
                                                        >
                                                            {sale.void_reason}
                                                        </span>
                                                    ) : (
                                                        <button
                                                            onClick={() => setSaleToDelete(sale)}
                                                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-red-500 hover:bg-red-600 transition cursor-pointer"
                                                        >
                                                            Void
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                        </tbody>
                    </table>
                </div>

                <Pagination
                    currentPage={page}
                    totalPages={lastPage}
                    totalItems={totalRecords}
                    pageSize={rowsPerPage}
                    onPageChange={setPage}
                />
            </div>

            {/* Void Confirmation Modal */}
            {saleToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-md p-4">
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-xl w-full">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-red-100 p-3">
                                    <TriangleAlert className="text-red-600 w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-lg">Void Voucher</h3>
                                    <p className="text-sm text-slate-500">Voucher #{saleToDelete.voucher_id}</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={handleCancelVoid}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-5 space-y-4">
                            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
                                Voiding this voucher will restore product stock.
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-600 mb-1">
                                    Void Reason
                                </label>
                                <select
                                    value={selectedReason}
                                    onChange={(e) => setSelectedReason(e.target.value)}
                                    className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                >
                                    <option value="">Select reason...</option>
                                    {voidReasons.map((reason) => (
                                        <option key={reason} value={reason}>
                                            {reason}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex justify-end space-x-3 pt-1">
                                <button
                                    type="button"
                                    onClick={handleCancelVoid}
                                    disabled={voiding}
                                    className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700 bg-slate-100 rounded-lg disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    disabled={!selectedReason || voiding}
                                    onClick={voidVoucher}
                                    className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm flex items-center gap-1.5 disabled:opacity-40"
                                >
                                    {voiding && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {voiding ? "Voiding..." : "Void Voucher"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}