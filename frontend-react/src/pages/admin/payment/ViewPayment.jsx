import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Loader2,
  RotateCcw,
  Search,
  Wallet,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import api from "../../../api/axios";
import Toast from "../../../components/common/Toast";
import Modal from "../../../components/common/Modal";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import Pagination from "../../../components/common/Pagination";
import AddPayment from "./AddPayment";
import EditPayment from "./EditPayment";

const ViewPayment = () => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [toastType, setToastType] = useState("success");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editPaymentId, setEditPaymentId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all"); // all | active | inactive
  const [search, setSearch] = useState("");
  const [confirmState, setConfirmState] = useState(null); // { type: 'delete'|'restore', id, name }
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const showToast = (message, type = "success") => {
    setToast(message);
    setToastType(type);
    setTimeout(() => setToast(""), 2500);
  };

  const fetchPaymentMethods = async () => {
    setLoading(true);
    try {
      const res = await api.get("/payment-methods");
      setPaymentMethods(res.data);
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to load payment methods",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const filteredPaymentMethods = useMemo(() => {
    let list = paymentMethods;
    if (statusFilter !== "all") {
      list = list.filter((m) => m.status === statusFilter);
    }
    const term = search.trim().toLowerCase();
    if (term) {
      list = list.filter((m) => m.payment_name?.toLowerCase().includes(term));
    }
    return list;
  }, [paymentMethods, statusFilter, search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, search, pageSize]);

  const totalItems = filteredPaymentMethods.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const paginatedPaymentMethods = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPaymentMethods.slice(start, start + pageSize);
  }, [filteredPaymentMethods, currentPage, pageSize]);

  const askConfirm = (type, id, name) => setConfirmState({ type, id, name });

  const handleConfirm = async () => {
    if (!confirmState) return;
    const { type, id, name } = confirmState;
    const newStatus = type === "delete" ? "inactive" : "active";
    try {
      const res = await api.put(`/payment-methods/${id}`, { status: newStatus });
      setPaymentMethods((prev) =>
        prev.map((m) => (m.payment_id === id ? res.data : m))
      );
      showToast(
        type === "delete" ? `"${name}" set to inactive` : `"${name}" restored`
      );
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to update payment method",
        "error"
      );
    } finally {
      setConfirmState(null);
    }
  };

  const summaryStats = useMemo(() => {
    const activeCount = paymentMethods.filter((m) => m.status === "active").length;
    const inactiveCount = paymentMethods.filter((m) => m.status === "inactive").length;

    return [
      {
        title: "TOTAL METHODS",
        value: paymentMethods.length,
        filterKey: "all",
        icon: Wallet,
        colorClass: "text-slate-500 bg-slate-50 border-slate-200",
        activeClass: "ring-2 ring-emerald-500 border-emerald-400 bg-slate-50/50",
      },
      {
        title: "ACTIVE METHODS",
        value: activeCount,
        filterKey: "active",
        icon: CheckCircle2,
        colorClass: "text-emerald-600 bg-emerald-50 border-emerald-100",
        activeClass: "ring-2 ring-emerald-500 border-emerald-400 bg-emerald-50/50",
      },
      {
        title: "INACTIVE METHODS",
        value: inactiveCount,
        filterKey: "inactive",
        icon: XCircle,
        colorClass: "text-rose-600 bg-rose-50 border-rose-100",
        activeClass: "ring-2 ring-emerald-500 border-emerald-400 bg-rose-50/50",
      },
    ];
  }, [paymentMethods]);

  return (
    <div className="min-h-screen">
      <Toast message={toast} type={toastType} />

      {/* Interactive Stat Cards Section */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {summaryStats.map((item) => {
          const IconComponent = item.icon;
          const isActive = statusFilter === item.filterKey;

          return (
            <button
              key={item.title}
              onClick={() => setStatusFilter(item.filterKey)}
              className={`w-full text-left bg-white rounded-2xl border p-5 flex items-center justify-between gap-3 transition-all duration-200 shadow-sm group hover:shadow-md cursor-pointer ${
                isActive ? item.activeClass : "hover:border-slate-300"
              }`}
            >
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wider font-bold text-slate-500 group-hover:text-slate-700 transition-colors">
                  {item.title}
                </p>
                <h2 className="text-2xl text-slate-800 font-bold">
                  {item.value}
                </h2>
              </div>
              <div className={`p-3 rounded-xl border ${item.colorClass} transition-transform group-hover:scale-105`}>
                <IconComponent className="w-5 h-5" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden mt-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-6 pb-4 w-full">

          {/* Left Side: Search Bar */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-84">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by payment name..."
                className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm bg-transparent cursor-text focus:outline-none focus:border-[#10B981] focus:ring-4 focus:ring-[#10B981]/15 transition"
              />
            </div>
          </div>

          {/* Right Side: Entries Dropdown and Add Payment Method Button */}
          <div className="flex items-center gap-4 w-full sm:w-auto sm:ml-auto justify-between sm:justify-end">
            <div className="flex items-center gap-2 text-xs text-slate-500 whitespace-nowrap">
              <span>Show</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="border rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:border-[#10B981] focus:ring-4 focus:ring-[#10B981]/15 cursor-pointer"
              >
                {[5, 10, 15, 20, 25].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <span>entries</span>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 px-4 py-2 text-sm font-semibold shadow-sm whitespace-nowrap cursor-pointer"
            >
              <Plus size={18} /> Add Payment Method
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-emerald-700 border-b border-emerald-800 text-white text-xs font-semibold uppercase">
                <th className="p-4">Payment Method Name</th>
                <th className="p-4 w-28">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading && (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
                    Loading payment methods...
                  </td>
                </tr>
              )}
              {!loading && filteredPaymentMethods.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-slate-400">
                    No payment methods found under this view.
                  </td>
                </tr>
              )}
              {!loading &&
                paginatedPaymentMethods.map((method) => {
                  const isInactive = method.status === "inactive";
                  const isProtected = method.payment_id <= 2;
                  return (
                    <tr
                      key={method.payment_id}
                      className={`hover:bg-slate-50 transition ${
                        isInactive ? "bg-slate-100/50 opacity-75" : ""
                      }`}
                    >
                      <td className="p-4">
                        <div className="font-semibold text-slate-800 flex items-center">
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${
                              isInactive ? "bg-slate-400" : "bg-emerald-500"
                            } mr-2`}
                          ></span>
                          {method.payment_name}
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            isInactive ? " text-red-500" : " text-green-600"
                          }`}
                        >
                          {isInactive ? "Inactive" : "Active"}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end items-center gap-2">
                          <button
                            onClick={() => setEditPaymentId(method.payment_id)}
                            className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-sky-500 hover:bg-sky-600 transition cursor-pointer"
                          >
                            Edit
                          </button>
                          {isInactive ? (
                            <button
                              onClick={() =>
                                askConfirm("restore", method.payment_id, method.payment_name)
                              }
                              disabled={isProtected}
                              title={
                                isProtected
                                  ? "Default payment methods can't be changed"
                                  : "Restore"
                              }
                              className={`px-2 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-700 border border-emerald-200 hover:bg-emerald-900 transition flex items-center gap-1 cursor-pointer ${
                                isProtected ? "opacity-30 cursor-not-allowed" : ""
                              }`}
                            >
                              
                              Restore
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                askConfirm("delete", method.payment_id, method.payment_name)
                              }
                              disabled={isProtected}
                              title={
                                isProtected
                                  ? "Default payment methods can't be deleted"
                                  : "Delete"
                              }
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-red-500 hover:bg-red-600 transition cursor-pointer ${
                                isProtected ? "opacity-30 cursor-not-allowed" : ""
                              }`}
                            >
                              Delete
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
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Modals & Dialogs */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} maxWidth="max-w-lg">
        <AddPayment
          existingPaymentNames={paymentMethods.map((m) => m.payment_name)}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchPaymentMethods();
            showToast("Payment method added successfully");
          }}
        />
      </Modal>

      <Modal isOpen={!!editPaymentId} onClose={() => setEditPaymentId(null)} maxWidth="max-w-lg">
        <EditPayment
          paymentId={editPaymentId}
          existingPaymentNames={paymentMethods
            .filter((m) => m.payment_id !== editPaymentId)
            .map((m) => m.payment_name)}
          onClose={() => setEditPaymentId(null)}
          onSuccess={() => {
            setEditPaymentId(null);
            fetchPaymentMethods();
            showToast("Payment method updated successfully");
          }}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmState}
        tone={confirmState?.type === "restore" ? "success" : "danger"}
        title={
          confirmState?.type === "restore"
            ? `Restore "${confirmState?.name}"?`
            : `Set "${confirmState?.name}" to inactive?`
        }
        message={
          confirmState?.type === "restore"
            ? "This payment method will become active again and visible on the cashier screen."
            : "This payment method will be hidden from the cashier screen. You can restore it anytime."
        }
        confirmLabel={confirmState?.type === "restore" ? "Restore" : "Delete"}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmState(null)}
      />
    </div>
  );
};

export default ViewPayment;