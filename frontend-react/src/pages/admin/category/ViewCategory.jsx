import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Loader2,
  RotateCcw,
  Search,
  Tag,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import api from "../../../api/axios";
import Toast from "../../../components/common/Toast";
import Modal from "../../../components/common/Modal";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import Pagination from "../../../components/common/Pagination";
import AddCategory from "./AddCategory";
import EditCategory from "./EditCategory";

const ViewCategory = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [toastType, setToastType] = useState("success");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [discountError, setDiscountError] = useState({});
  const [taxError, setTaxError] = useState({});
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

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to load categories",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    let list = categories;
    if (statusFilter !== "all") {
      list = list.filter((c) => c.status === statusFilter);
    }
    const term = search.trim().toLowerCase();
    if (term) {
      list = list.filter((c) => c.category_name?.toLowerCase().includes(term));
    }
    return list;
  }, [categories, statusFilter, search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, search, pageSize]);

  const totalItems = filteredCategories.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCategories.slice(start, start + pageSize);
  }, [filteredCategories, currentPage, pageSize]);

  // PUT /api/categories/:id — inline tax edit, same onBlur save pattern
  const handleTaxChange = async (categoryId, value) => {
    const tax = parseFloat(value);

    if (Number.isNaN(tax) || tax < 0 || tax > 100) {
      setTaxError((prev) => ({
        ...prev,
        [categoryId]: "Tax rate must be between 0 and 100.",
      }));
      return;
    }

    setTaxError((prev) => ({ ...prev, [categoryId]: "" }));

    try {
      const res = await api.put(`/categories/${categoryId}`, { tax });
      setCategories((prev) =>
        prev.map((c) => (c.category_id === categoryId ? res.data : c))
      );
      showToast("Tax updated");
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to update tax",
        "error"
      );
    }
  };

  // PUT /api/categories/:id — inline discount edit, mirrors ProductsView's
  // handleDiscountChange pattern (onBlur save with per-row error state).
  const handleDiscountChange = async (categoryId, value) => {
    const discount_category = parseFloat(value);

    if (Number.isNaN(discount_category) || discount_category < 0 || discount_category > 100) {
      setDiscountError((prev) => ({
        ...prev,
        [categoryId]: "Discount rate must be between 0 and 100.",
      }));
      return;
    }

    setDiscountError((prev) => ({ ...prev, [categoryId]: "" }));

    try {
      const res = await api.put(`/categories/${categoryId}`, { discount_category });
      setCategories((prev) =>
        prev.map((c) => (c.category_id === categoryId ? res.data : c))
      );
      showToast("Discount updated");
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to update discount",
        "error"
      );
    }
  };

  const askConfirm = (type, id, name) => setConfirmState({ type, id, name });

  const handleConfirm = async () => {
    if (!confirmState) return;
    const { type, id, name } = confirmState;
    const newStatus = type === "delete" ? "inactive" : "active";
    try {
      const res = await api.put(`/categories/${id}`, { status: newStatus });
      setCategories((prev) => prev.map((c) => (c.category_id === id ? res.data : c)));
      showToast(
        type === "delete" ? `"${name}" set to inactive` : `"${name}" restored`
      );
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to update category",
        "error"
      );
    } finally {
      setConfirmState(null);
    }
  };

  const summaryStats = useMemo(() => {
    const activeCount = categories.filter((c) => c.status === "active").length;
    const inactiveCount = categories.filter((c) => c.status === "inactive").length;

    return [
      {
        title: "TOTAL CATEGORIES",
        value: categories.length,
        filterKey: "all",
        icon: Tag,
        colorClass: "text-slate-500 bg-slate-50 border-slate-200",
        activeClass: "ring-2 ring-emerald-500 border-emerald-400 bg-slate-50/50",
      },
      {
        title: "ACTIVE CATEGORIES",
        value: activeCount,
        filterKey: "active",
        icon: CheckCircle2,
        colorClass: "text-emerald-600 bg-emerald-50 border-emerald-100",
        activeClass: "ring-2 ring-emerald-500 border-emerald-400 bg-emerald-50/50",
      },
      {
        title: "INACTIVE CATEGORIES",
        value: inactiveCount,
        filterKey: "inactive",
        icon: XCircle,
        colorClass: "text-rose-600 bg-rose-50 border-rose-100",
        activeClass: "ring-2 ring-emerald-500 border-emerald-400 bg-rose-50/50",
      },
    ];
  }, [categories]);

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
              className={`w-full text-left bg-white rounded-2xl border p-5 flex items-center justify-between gap-3 transition-all duration-200 shadow-sm group hover:shadow-md cursor-pointer ${isActive ? item.activeClass : "hover:border-slate-300"
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
                placeholder="Search by category name..."
                className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm bg-transparent cursor-text focus:outline-none focus:border-[#10B981] focus:ring-4 focus:ring-[#10B981]/15 transition"
              />
            </div>
          </div>

          {/* Right Side: Entries Dropdown and Add New Category Button */}
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
              <Plus size={18} /> Add New Category
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-emerald-700 border-b border-emerald-800 text-white text-xs font-semibold uppercase">

                <th className="p-4 w-100">Category Name</th>
                <th className="p-4 w-100">Tax</th>
                <th className="p-4 w-100">Discount</th>
                <th className="p-4 w-30">Status</th>
                <th className="p-4 w-50 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
                    Loading categories...
                  </td>
                </tr>
              )}
              {!loading && filteredCategories.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    No categories found under this view.
                  </td>
                </tr>
              )}
              {!loading &&
                paginatedCategories.map((cat) => {
                  const isInactive = cat.status === "inactive";
                  return (
                    <tr
                      key={cat.category_id}
                      className={`hover:bg-slate-50 transition`}
                    >

                      <td className="p-4 font-semibold text-slate-800">
                        {cat.category_name}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-1">
                          <input
                            type="number"
                            step="1"
                            min={0}
                            max="100"
                            defaultValue={cat.tax}
                         
                            onBlur={(e) =>
                              handleTaxChange(cat.category_id, e.target.value)
                            }
                            className="w-16 p-1 text-center border border-slate-200 rounded text-xs font-bold text-slate-700 focus:ring-1 focus:ring-emerald-500 focus:outline-none bg-white disabled:bg-slate-50 disabled:text-slate-400"
                          />
                          <span className="text-xs text-slate-400">%</span>
                        </div>
                        {taxError[cat.category_id] && (
                          <p className="text-[10px] text-rose-600 mt-1">
                            {taxError[cat.category_id]}
                          </p>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-1">
                          <input
                            type="number"
                            step="1"
                            min={0}
                            max="100"
                            defaultValue={cat.discount_category}
                            
                            onBlur={(e) =>
                              handleDiscountChange(cat.category_id, e.target.value)
                            }
                            className="w-16 p-1 text-center border border-slate-200 rounded text-xs font-bold text-slate-700 focus:ring-1 focus:ring-emerald-500 focus:outline-none bg-white disabled:bg-slate-50 disabled:text-slate-400"
                          />
                          <span className="text-xs text-slate-400">%</span>
                        </div>
                        {discountError[cat.category_id] && (
                          <p className="text-[10px] text-rose-600 mt-1">
                            {discountError[cat.category_id]}
                          </p>
                        )}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-block w-[70px] text-center py-1 rounded-lg text-xs font-semibold ${isInactive
                            ? "bg-red-50 text-red-500 border border-red-200"
                            : "bg-green-50 text-green-600 border border-green-200"
                            }`}
                        >
                          {isInactive ? "Inactive" : "Active"}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end items-center gap-2">
                          <button
                            onClick={() => setEditCategoryId(cat.category_id)}
                            className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-sky-500 hover:bg-sky-600 transition cursor-pointer"
                          >
                            Edit
                          </button>
                          {isInactive ? (
                            <button
                              onClick={() =>
                                askConfirm("restore", cat.category_id, cat.category_name)
                              }
                              className="px-2 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-500 border border-emerald-200 hover:bg-emerald-600 transition flex items-center gap-1 cursor-pointer"
                            >

                              Restore
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                askConfirm("delete", cat.category_id, cat.category_name)
                              }
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-red-500 hover:bg-red-600 transition cursor-pointer"
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

        <div className="overflow-x-auto">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Modals & Dialogs */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} maxWidth="max-w-lg">
        <AddCategory
          existingCategoryNames={categories.map((c) => c.category_name)}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchCategories();
            showToast("Category added successfully");
          }}
        />
      </Modal>

      <Modal isOpen={!!editCategoryId} onClose={() => setEditCategoryId(null)} maxWidth="max-w-lg">
        <EditCategory
          categoryId={editCategoryId}
          existingCategoryNames={categories
            .filter((c) => c.category_id !== editCategoryId)
            .map((c) => c.category_name)}
          onClose={() => setEditCategoryId(null)}
          onSuccess={() => {
            setEditCategoryId(null);
            fetchCategories();
            showToast("Category updated successfully");
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
            ? "This category will become active again."
            : "This category will be hidden but can be restored anytime."
        }
        confirmLabel={confirmState?.type === "restore" ? "Restore" : "Delete"}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmState(null)}
      />
    </div>
  );
};

export default ViewCategory;