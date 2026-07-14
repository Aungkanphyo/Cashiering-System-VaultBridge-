import { useEffect, useState } from "react";
import ViewDetails from "./ViewDetails";
import api from "../../../api/axios";
import Toast from "../../../components/common/Toast";
import Modal from "../../../components/common/Modal";
import Pagination from "../../../components/common/Pagination";
import { Search, RotateCcw, Eye, Loader2, Wallet, QrCode } from "lucide-react";

const ViewHistory = () => {
  // Server-side State Management
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [toastType, setToastType] = useState("success");

  // Database Payment Methods State
  const [dbPaymentMethods, setDbPaymentMethods] = useState([]);

  // Filter Controller States
  const [searchId, setSearchId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Server-side Pagination States
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Modal & Voucher State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);

  const showToast = (message, type = "success") => {
    setToast(message);
    setToastType(type);
    setTimeout(() => setToast(""), 2500);
  };

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const response = await api.get("/payment-methods");
        const activeMethods = response.data.filter(
          (m) => m.status.toLowerCase() === "active"
        );
        setDbPaymentMethods(activeMethods);
      } catch (err) {
        console.error("Failed to fetch payment methods for filter:", err);
      }
    };
    fetchPaymentMethods();
  }, []);

  useEffect(() => {
    const fetchVouchers = async () => {
      setIsLoading(true);
      try {
        const response = await api.get("/admin/vouchers", {
          params: {
            page: currentPage,
            search_id: searchId.trim(),
            payment_method: paymentMethod === "ALL" ? "" : paymentMethod,
            status: status === "ALL" ? "" : status,
            from_date: fromDate,
            to_date: toDate,
            per_page: pageSize,
          },
        });

        const responseData = response.data.data ? response.data.data : response.data;
        const metaData = response.data.meta ? response.data.meta : response.data;

        setTransactions(responseData || []);
        setTotalPages(metaData.last_page || metaData.meta?.last_page || 1);
        setTotalRecords(metaData.total || metaData.meta?.total || 0);
      } catch (err) {
        showToast(
          err.response?.data?.message || "Failed to load sales history",
          "error"
        );
      } finally {
        setIsLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchVouchers();
    }, 800);

    return () => clearTimeout(delayDebounceFn);
  }, [currentPage, pageSize, searchId, paymentMethod, status, fromDate, toDate]);

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
    <div className="min-h-screen">
      <Toast message={toast} type={toastType} />

      {/* Filter Panel */}
      <div className="bg-white rounded-2xl border shadow-sm p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
          {/* Voucher ID Search */}
          <div className="relative w-full sm:w-84">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Voucher ID..."
              value={searchId}
              onChange={(e) => {
                setSearchId(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm bg-transparent cursor-text focus:outline-none focus:border-[#10B981] focus:ring-4 focus:ring-[#10B981]/15 transition"
            />
          </div>

          {/* Payment Method */}
          <select
            value={paymentMethod}
            onChange={(e) => {
              setPaymentMethod(e.target.value);
              setCurrentPage(1);
            }}
            className="border rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 bg-white focus:outline-none focus:border-[#10B981] focus:ring-4 focus:ring-[#10B981]/15 cursor-pointer"
          >
            <option value="ALL">All Methods</option>
            {dbPaymentMethods.map((method) => (
              <option key={method.payment_id} value={method.payment_name}>
                {method.payment_name}
              </option>
            ))}
          </select>

          {/* Status */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="border rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 bg-white focus:outline-none focus:border-[#10B981] focus:ring-4 focus:ring-[#10B981]/15 cursor-pointer"
          >
            <option value="ALL">All Status</option>
            <option value="completed">Completed</option>
            <option value="voided">Voided</option>
          </select>

          {/* Date Range */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-slate-600">FROM:</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setCurrentPage(1);
              }}
              className="border rounded-lg px-3 py-2 cursor-text focus:outline-none focus:border-[#10B981] focus:ring-4 focus:ring-[#10B981]/15"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-slate-600">TO:</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setCurrentPage(1);
              }}
              className="border rounded-lg px-3 py-2 cursor-text focus:outline-none focus:border-[#10B981] focus:ring-4 focus:ring-[#10B981]/15"
            />
          </div>

          <button
            onClick={handleReset}
            className="flex items-center gap-2 rounded-lg bg-red-600 text-white hover:bg-red-700 px-4 py-2 text-sm font-semibold shadow-sm whitespace-nowrap cursor-pointer lg:ml-auto"
          >
            <RotateCcw size={18} />
            Reset Filter
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden mt-8">
        <div className="flex items-center justify-between gap-4 p-6 pb-4">
          <h2 className="font-bold text-lg text-slate-800">Sales History</h2>
          <div className="flex items-center gap-2 text-xs text-slate-500 whitespace-nowrap">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:border-[#10B981] focus:ring-4 focus:ring-[#10B981]/15 cursor-pointer"
            >
              {[8, 10, 15, 20, 25].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <span>entries</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-emerald-700 border-b border-emerald-800 text-white text-xs font-semibold uppercase">
                <th className="p-4 w-16 text-center">No.</th>
                <th className="p-4">Sale ID</th>
                <th className="p-4">Date &amp; Time</th>
                <th className="p-4 text-right">Total Grand</th>
                <th className="p-4 text-right">Change</th>
                <th className="p-4 text-center">Payment Method</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center w-32">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {isLoading && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
                    Loading sales history...
                  </td>
                </tr>
              )}
              {!isLoading && transactions.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No sales history matches the selected filters.
                  </td>
                </tr>
              )}
              {!isLoading &&
                transactions.map((tx, idx) => {
                  const isVoided = tx.status?.toLowerCase() === "voided";
                  const isCash = tx.paymentMethod?.toLowerCase().includes("cash");
                  return (
                    <tr
                      key={`${tx.id}-${idx}`}
                      className={`hover:bg-slate-50 transition ${
                        isVoided ? "bg-rose-50/40" : ""
                      }`}
                    >
                      <td className="p-4 font-bold text-center text-slate-400">
                        {(currentPage - 1) * pageSize + idx + 1}.
                      </td>
                      <td className="p-4 font-mono font-semibold text-slate-800">
                        #{tx.id}
                      </td>
                      <td className="p-4 font-mono text-xs text-slate-500 whitespace-nowrap">
                        {tx.dateTime}
                      </td>
                      <td className="p-4 text-right font-mono font-semibold text-slate-800 whitespace-nowrap">
                        <span className={isVoided ? "line-through text-slate-400" : ""}>
                          {(tx.finalAmount || 0).toLocaleString()} Ks
                        </span>
                      </td>
                      <td className="p-4 text-right font-mono font-semibold text-amber-600 whitespace-nowrap">
                        {isVoided ? (
                          <span className="text-slate-400 line-through">
                            {(tx.changeAmount || 0).toLocaleString()} Ks
                          </span>
                        ) : (
                          <span>{(tx.changeAmount || 0).toLocaleString()} Ks</span>
                        )}
                      </td>
                      <td className="p-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold border ${
                            isCash
                              ? "bg-yellow-50 text-yellow-700 border-yellow-100"
                              : "bg-blue-50 text-blue-600 border-blue-100"
                          }`}
                        >
                          {isCash ? (
                            <Wallet className="w-3.5 h-3.5" />
                          ) : (
                            <QrCode className="w-3.5 h-3.5" />
                          )}
                          {tx.paymentMethod}: {(tx.paidAmount || tx.finalAmount || 0).toLocaleString()} Ks
                        </span>
                      </td>
                      <td className="p-4 text-center whitespace-nowrap">
                        {!isVoided ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px] uppercase tracking-wide">
                            Completed
                          </span>
                        ) : (
                          <div className="flex flex-col items-center gap-0.5">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 font-bold text-[10px] uppercase tracking-wide">
                              Voided
                            </span>
                            {tx.voidReason && (
                              <span
                                className="text-[10px] text-rose-400 italic max-w-[140px] truncate"
                                title={tx.voidReason}
                              >
                                {tx.voidReason}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleViewVoucher(tx)}
                          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalRecords}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Voucher Detail Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedVoucher(null);
        }}
        maxWidth="max-w-lg"
      >
        <ViewDetails
          transaction={selectedVoucher}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedVoucher(null);
          }}
        />
      </Modal>
    </div>
  );
};

export default ViewHistory;