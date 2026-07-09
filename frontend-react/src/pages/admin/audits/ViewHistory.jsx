import { useEffect, useState } from "react";
import ViewDetails from "./ViewDetails";
import api from "../../../api/axios";
import {
    Search,
    RotateCcw,
    Calendar,
    ArrowRight,
    Eye,
    ChevronsLeft,
    ChevronLeft,
    ChevronRight,
    ChevronsRight
} from "lucide-react";

const ViewHistory = () => {
    // Server-side State Management
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Advanced Input Controller States
    const [searchId, setSearchId] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("ALL");
    const [status, setStatus] = useState("ALL");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    // Server-side Pagination States
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0); // 🌟 Total Records State

    // Modal & Voucher State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedVoucher, setSelectedVoucher] = useState(null);

    useEffect(() => {
        const fetchVouchers = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const response = await api.get("/admin/vouchers", {
                    params: {
                        page: currentPage,
                        search_id: searchId.trim(),
                        payment_method: paymentMethod,
                        status: status,
                        from_date: fromDate,
                        to_date: toDate,
                        per_page: 8
                    }
                });

                // 🌟 Laravel Resource Collection ကြောင့် ရောက်လာမည့် Pagination 구조ကို စစ်ဆေးခြင်း
                // API response ပုံစံပေါ်မူတည်ပြီး data နဲ့ meta ကို ဆွဲထုတ်တာဖြစ်ပါတယ်။
                const responseData = response.data.data ? response.data.data : response.data;
                const metaData = response.data.meta ? response.data.meta : response.data;

                setTransactions(responseData || []);
                
                // 🌟 Total Records နှင့် Pages များကို တိုင်ပတ်မှုမရှိအောင် ပေါင်းစပ်ရယူခြင်း
                setTotalPages(metaData.last_page || metaData.meta?.last_page || 1);
                setTotalRecords(metaData.total || metaData.meta?.total || 0);

            } catch (error) {
                setError(error.response?.data?.message || "Failed to fetch data from server.");
            } finally {
                setIsLoading(false);
            }
        };

        const delayDebounceFn = setTimeout(() => {
            fetchVouchers();
        }, 800);

        return () => clearTimeout(delayDebounceFn);
    }, [currentPage, searchId, paymentMethod, status, fromDate, toDate]);

    const handleReset = () => {
        setSearchId("");
        setPaymentMethod("ALL");
        setStatus("ALL");
        setFromDate("");
        setToDate("");
        setCurrentPage(1);
    };

    const handleViewVoucher = (voucher) => {
        setSelectedVoucher(voucher);
        setIsModalOpen(true);
    };

    return (
        <div className="relative min-h-screen bg-[#f8fafc]">
            <div className={`px-8 pt-6 pb-8 space-y-6 transition-all duration-300 ${isModalOpen ? "blur-sm pointer-events-none select-none" : ""}`}>

                {/* Minimalist White Filter Panel */}
                <div className="bg-white px-6 py-4 rounded-2xl border border-gray-100 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    
                    <div className="flex flex-wrap items-center gap-3 flex-1">
                        <div className="relative w-full sm:w-64">
                            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search by Voucher ID..."
                                value={searchId}
                                onChange={(e) => { setSearchId(e.target.value); setCurrentPage(1); }}
                                className="w-full pl-10 pr-4 py-2 bg-[#f8fafc] border border-gray-100 rounded-xl text-sm font-medium text-gray-600 outline-none focus:border-[#00aa5b] focus:bg-white focus:ring-2 focus:ring-[#00aa5b]/5 transition-all placeholder:text-gray-400"
                            />
                        </div>

                        <select
                            value={paymentMethod}
                            onChange={(e) => { setPaymentMethod(e.target.value); setCurrentPage(1); }}
                            className="w-full sm:w-40 px-3 py-2 bg-[#f8fafc] border border-gray-100 rounded-xl text-sm font-bold text-gray-600 outline-none focus:border-[#00aa5b] focus:bg-white transition-all cursor-pointer"
                        >
                            <option value="ALL">All Methods</option>
                            <option value="CASH">Cash</option>
                            <option value="KPAY">KPay</option>
                            <option value="WAVE">Wave Pay</option>
                        </select>

                        <select
                            value={status}
                            onChange={(e) => { setStatus(e.target.value); setCurrentPage(1); }}
                            className="w-full sm:w-40 px-3 py-2 bg-[#f8fafc] border border-gray-100 rounded-xl text-sm font-bold text-gray-600 outline-none focus:border-[#00aa5b] focus:bg-white transition-all cursor-pointer"
                        >
                            <option value="ALL">All Status</option>
                            <option value="completed">Completed</option>
                            <option value="voided">Voided</option>
                        </select>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 justify-end">
                        <div className="flex items-center gap-2 bg-[#f8fafc] border border-gray-100 rounded-xl px-3 py-2 h-[38px] w-full sm:w-auto">
                            <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                            <span className="text-xs font-semibold text-gray-400">From</span>
                            <input
                                type="date"
                                value={fromDate}
                                onChange={(e) => { setFromDate(e.target.value); setCurrentPage(1); }}
                                className="bg-transparent text-sm font-semibold text-gray-600 outline-none cursor-pointer w-full sm:w-28"
                            />
                        </div>

                        <ArrowRight className="w-3.5 h-3.5 text-gray-300 hidden sm:block" />

                        <div className="flex items-center gap-2 bg-[#f8fafc] border border-gray-100 rounded-xl px-3 py-2 h-[38px] w-full sm:w-auto">
                            <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                            <span className="text-xs font-semibold text-gray-400">To</span>
                            <input
                                type="date"
                                value={toDate}
                                onChange={(e) => { setToDate(e.target.value); setCurrentPage(1); }}
                                className="bg-transparent text-sm font-semibold text-gray-600 outline-none cursor-pointer w-full sm:w-28"
                            />
                        </div>

                        <button
                            onClick={handleReset}
                            className="flex items-center gap-1.5 px-4 py-2 bg-[#00aa5b] hover:bg-[#00944f] text-white font-bold text-sm rounded-xl shadow-sm transition-all h-[38px] w-full sm:w-auto justify-center"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Reset
                        </button>
                    </div>
                </div>

                {/* Main Table Wrapper */}
                <div className="bg-white rounded-2xl shadow-[0_2px_12px_-3px_rgba(0,0,0,0.02)] border border-gray-100 overflow-hidden flex flex-col">
                    <div className="overflow-x-auto scrollbar-none">
                        <table className="w-full text-left border-collapse min-w-[1100px] table-auto">
                            <thead>
                                <tr className="bg-[#08694b] text-white text-xs uppercase font-bold tracking-wider select-none">
                                    <th className="py-4 px-6 w-20 text-center">No.</th>
                                    <th className="py-4 px-6">Sale ID</th>
                                    <th className="py-4 px-6">Date & Time</th>
                                    <th className="py-4 px-6 text-right">Total Grand</th>
                                    <th className="py-4 px-6 text-right">Change</th>
                                    <th className="py-4 px-6 text-center">Payment Method</th>
                                    <th className="py-4 px-6 text-center">Status</th>
                                    <th className="py-4 px-6 text-center w-36">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm font-medium text-gray-600">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="8" className="text-center py-16 text-emerald-600 font-bold animate-pulse">
                                            Loading data from database...
                                        </td>
                                    </tr>
                                ) : error ? (
                                    <tr>
                                        <td colSpan="8" className="text-center py-16 text-red-500 font-semibold">
                                            {error}
                                        </td>
                                    </tr>
                                ) : transactions.length > 0 ? (
                                    transactions.map((tx, idx) => (
                                        <tr
                                            key={`${tx.id}-${idx}`}
                                            className={`hover:bg-emerald-50/40 transition-all duration-150 group ${tx.status === "voided" ? "bg-red-50/30" : ""}`}
                                        >
                                            <td className="py-4 px-6 font-bold text-center text-gray-400">
                                                {((currentPage - 1) * 8) + (idx + 1)}.
                                            </td>

                                            <td className="py-4 px-6 font-black text-gray-900 font-mono">
                                                #{tx.id}
                                            </td>

                                            <td className="py-4 px-6 text-gray-400 font-mono text-xs whitespace-nowrap">
                                                {tx.dateTime}
                                            </td>

                                            <td className="py-4 px-6 text-right font-mono font-black text-slate-900 whitespace-nowrap" >
                                                <span className={tx.status === "voided" ? "line-through text-gray-400" : ""}>
                                                    {(tx.finalAmount || 0).toLocaleString()} Ks
                                                </span>
                                            </td>

                                            <td className="py-4 px-6 text-right font-mono font-bold text-amber-600 bg-amber-50/10 whitespace-nowrap">
                                                {tx.status === "voided" ? (
                                                    <span className="text-gray-400 line-through">{(tx.changeAmount || 0).toLocaleString()} Ks</span>
                                                ) : (
                                                    <span>{(tx.changeAmount || 0).toLocaleString()} Ks</span>
                                                )}
                                            </td>

                                            <td className="py-4 px-6 text-center whitespace-nowrap">
                                                {tx.paymentMethod?.toLowerCase().includes("cash") ? (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-100 text-xs font-bold">
                                                        💵 Cash: {(tx.paidAmount || tx.finalAmount || 0).toLocaleString()} Ks
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-blue-50 text-blue-600 border border-blue-100 text-xs font-bold">
                                                        📱 {tx.paymentMethod}: {(tx.finalAmount || 0).toLocaleString()} Ks
                                                    </span>
                                                )}
                                            </td>

                                            <td className="py-4 px-6 text-center whitespace-nowrap">
                                                {tx.status === "completed" ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-sans font-bold text-[10px] uppercase tracking-wide">
                                                        COMPLETED
                                                    </span>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 font-sans font-bold text-[10px] uppercase tracking-wide">
                                                            VOIDED
                                                        </span>
                                                        {tx.voidReason && (
                                                            <span className="text-[10px] text-red-400 font-medium italic mt-0.5 max-w-[140px] truncate" title={tx.voidReason}>
                                                                {tx.voidReason}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </td>

                                            <td className="py-4 px-6 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => handleViewVoucher(tx)}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="text-center py-16 text-gray-400 font-medium italic">
                                            No sales history or vouchers match the specified filters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Bar */}
                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400 font-bold select-none">
                        {/* 🌟 ဤနေရာတွင် Total Record အရေအတွက် အစစ်အမှန် ပေါ်လာပါမည် */}
                        <span className="text-gray-500">
                            Total <span className="text-[#08694b] font-black text-sm">{totalRecords.toLocaleString()}</span> Records Found
                        </span>

                        <div className="flex items-center gap-1">
                            <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="p-1.5 rounded-md hover:bg-gray-200 text-gray-500 disabled:opacity-30 transition-colors">
                                <ChevronsLeft className="w-4 h-4" />
                            </button>
                            <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="p-1.5 rounded-md hover:bg-gray-200 text-gray-500 disabled:opacity-30 transition-colors">
                                <ChevronLeft className="w-4 h-4" />
                            </button>

                            <div className="flex items-center gap-1 px-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`w-7 h-7 rounded-md font-bold text-xs flex items-center justify-center border transition-all ${currentPage === page ? "bg-[#08694b] border-[#08694b] text-white shadow-sm" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>

                            <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="p-1.5 rounded-md hover:bg-gray-200 text-gray-500 disabled:opacity-30 transition-colors">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                            <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="p-1.5 rounded-md hover:bg-gray-200 text-gray-500 disabled:opacity-30 transition-colors">
                                <ChevronsRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

            </div>

            <ViewDetails
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setSelectedVoucher(null); }}
                transaction={selectedVoucher}
            />
        </div>
    );
};

export default ViewHistory;