import { useState, useEffect, useMemo } from "react";
import { Plus, Loader2, RotateCcw, Search } from "lucide-react";
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

  // GET /api/categories
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

  // Reset back to page 1 whenever the filter, search term, or page size changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, search, pageSize]);

  const totalItems = filteredCategories.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Keep currentPage valid if the list shrinks (e.g. after a delete)
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCategories.slice(start, start + pageSize);
  }, [filteredCategories, currentPage, pageSize]);

  // Opens the custom confirmation box (used for both Delete and Restore)
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
                placeholder="Search by category name..."
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
              <span>Add New Category</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-emerald-700 border-b border-emerald-800 text-white text-xs font-semibold uppercase">
              
              <th className="p-4 w-100">Category Name</th>
              <th className="p-4 w-100">Default Tax (%)</th>
              <th className="p-4 w-100">Default Discount (%)</th>
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
                  No categories found.
                </td>
              </tr>
            )}
            {!loading &&
              paginatedCategories.map((cat) => {
                const isInactive = cat.status === "inactive";
                return (
                  <tr
                    key={cat.category_id}
                    className={`hover:bg-slate-50 transition ${
                      isInactive ? "bg-slate-100/50 opacity-75" : ""
                    }`}
                  >
                    
                    <td className="p-4 font-semibold text-slate-800">
                      {cat.category_name}
                    </td>
                    <td className="p-4 font-bold text-slate-700">
                      {Number(cat.tax) || 0}% 
                    </td>
                    <td className="p-4 font-bold text-slate-700">
                      {Number(cat.discount_category) || 0}% 
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
                            onClick={() => setEditCategoryId(cat.category_id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition"
                          >
                            Edit
                          </button>
                        )}
                        {isInactive ? (
                          <button
                            onClick={() =>
                              askConfirm("restore", cat.category_id, cat.category_name)
                            }
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition flex items-center gap-1"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Restore
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              askConfirm("delete", cat.category_id, cat.category_name)
                            }
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-200 transition"
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
    </section>
  );
};

export default ViewCategory;