import { useState, useEffect, useMemo } from "react";
import { Plus, Loader2, RotateCcw, Search } from "lucide-react";
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

  // GET /api/payment-methods
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

  // Reset back to page 1 whenever the filter, search term, or page size changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, search, pageSize]);

  const totalItems = filteredPaymentMethods.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Keep currentPage valid if the list shrinks (e.g. after a delete)
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const paginatedPaymentMethods = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPaymentMethods.slice(start, start + pageSize);
  }, [filteredPaymentMethods, currentPage, pageSize]);

  // Opens the custom confirmation box (used for both Delete and Restore)
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

  const filterTabs = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "inactive", label: "Inactive" },
  ];

  return (
    <section className="space-y-6">
      <Toast message={toast} type={toastType} />

      {/* Unified header + filters card: search + status dropdown on left, page-size + Add button rightmost */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by payment name..."
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:outline-none transition"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-lg text-sm font-semibold border border-slate-200 text-slate-600 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {filterTabs.map((tab) => (
                <option key={tab.key} value={tab.key}>
                  {tab.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Show</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-700 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold flex items-center space-x-1.5 shadow-sm shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Payment Method</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
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
                <td colSpan={4} className="p-8 text-center text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
                  Loading payment methods...
                </td>
              </tr>
            )}
            {!loading && filteredPaymentMethods.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-400">
                  No payment methods found.
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
                    className={`hover:bg-slate-50 transition duration-150 ${isInactive ? "bg-slate-100/50 opacity-75" : ""
                      }`}
                  >
                    
                    <td className="p-4">
                      <div className="font-bold text-slate-800 flex items-center">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${isInactive ? "bg-slate-400" : "bg-emerald-500"
                            } mr-2`}
                        ></span>
                        {method.payment_name}
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          isInactive
                            ? "bg-slate-200 text-slate-600"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {isInactive ? "Inactive" : "Active"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end items-center gap-2">
                        {!isInactive && (
                          <button
                            onClick={() => setEditPaymentId(method.payment_id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition"
                          >
                            Edit
                          </button>
                        )}
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
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition flex items-center gap-1 ${
                              isProtected ? "opacity-30 cursor-not-allowed" : ""
                            }`}
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
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
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-200 transition ${isProtected ? "opacity-30 cursor-not-allowed" : ""
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

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>

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
    </section>
  );
};

export default ViewPayment;