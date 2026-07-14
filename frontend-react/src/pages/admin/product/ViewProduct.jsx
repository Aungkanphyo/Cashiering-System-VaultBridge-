import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Loader2,
  RotateCcw,
  Search,
  Package,
  CheckCircle2,
  XCircle,
  TriangleAlert,
} from "lucide-react";
import api from "../../../api/axios";
import Toast from "../../../components/common/Toast";
import Modal from "../../../components/common/Modal";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import Pagination from "../../../components/common/Pagination";
import AddProduct from "./AddProduct";
import EditProduct from "./EditProduct";

const ProductsView = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [toastType, setToastType] = useState("success");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editProductId, setEditProductId] = useState(null);
  const [discountError, setDiscountError] = useState({});
  const [statusFilter, setStatusFilter] = useState("all"); // all | active | inactive | low_stock
  const [search, setSearch] = useState("");
  const [confirmState, setConfirmState] = useState(null); // { type: 'delete'|'restore', id, name }
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const showToast = (message, type = "success") => {
    setToast(message);
    setToastType(type);
    setTimeout(() => setToast(""), 2500);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        api.get("/products"),
        api.get("/categories"),
      ]);
      setProducts(productsRes.data);
      setCategories(categoriesRes.data);
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to load products",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getCategory = (categoryId) =>
    categories.find((c) => c.category_id === categoryId) || null;

  const getCategoryName = (categoryId) => {
    const cat = getCategory(categoryId);
    return cat ? cat.category_name : "General";
  };

  const getSalePrice = (product) => {
    const cat = getCategory(product.category_id);
    const tax = cat ? Number(cat.tax || 0) : 0;
    const price = Number(product.price || 0);
    return price + (price * tax) / 100;
  };

  const getDiscountFloor = (product) => {
    const cat = getCategory(product.category_id);
    return cat ? Number(cat.discount_category || 0) : 0;
  };

  const filteredProducts = useMemo(() => {
    let list = products;
    
    // Support the regular status states + the custom low_stock rule
    if (statusFilter === "active" || statusFilter === "inactive") {
      list = list.filter((p) => p.status === statusFilter);
    } else if (statusFilter === "low_stock") {
      list = list.filter((p) => p.stock_quantity <= p.min_stock_level);
    }

    const term = search.trim().toLowerCase();
    if (term) {
      list = list.filter((p) => {
        const nameMatch = p.product_name?.toLowerCase().includes(term);
        const categoryMatch = getCategoryName(p.category_id)
          .toLowerCase()
          .includes(term);
        return nameMatch || categoryMatch;
      });
    }
    return list;
  }, [products, categories, statusFilter, search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, search, pageSize]);

  const totalItems = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  const handleDiscountChange = async (productId, value) => {
    const discount_rate = parseFloat(value);
    const product = products.find((p) => p.product_id === productId);
    const floor = product ? getDiscountFloor(product) : 0;

    if (Number.isNaN(discount_rate) || discount_rate < 0 || discount_rate > 100) {
      setDiscountError((prev) => ({
        ...prev,
        [productId]: "Discount rate must be between 0 and 100.",
      }));
      return;
    }

    if (discount_rate < floor) {
      setDiscountError((prev) => ({
        ...prev,
        [productId]: `Discount rate cannot be lower than ${floor}% for this category.`,
      }));
      return;
    }

    setDiscountError((prev) => ({ ...prev, [productId]: "" }));

    try {
      const res = await api.put(`/products/${productId}`, { discount_rate });
      setProducts((prev) =>
        prev.map((p) => (p.product_id === productId ? res.data : p))
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
      const res = await api.put(`/products/${id}`, { status: newStatus });
      setProducts((prev) => prev.map((p) => (p.product_id === id ? res.data : p)));
      showToast(
        type === "delete" ? `"${name}" set to inactive` : `"${name}" restored`
      );
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to update product",
        "error"
      );
    } finally {
      setConfirmState(null);
    }
  };

  const summaryStats = useMemo(() => {
    const activeCount = products.filter((p) => p.status === "active").length;
    const inactiveCount = products.filter((p) => p.status === "inactive").length;
    const lowStockCount = products.filter(
      (p) => p.stock_quantity <= p.min_stock_level
    ).length;

    return [
      {
        title: "TOTAL PRODUCTS",
        value: products.length,
        filterKey: "all",
        icon: Package,
        colorClass: "text-slate-500 bg-slate-50 border-slate-200",
        activeClass: "ring-2 ring-emerald-500 border-emerald-400 bg-slate-50/50",
      },
      {
        title: "ACTIVE PRODUCTS",
        value: activeCount,
        filterKey: "active",
        icon: CheckCircle2,
        colorClass: "text-emerald-600 bg-emerald-50 border-emerald-100",
        activeClass: "ring-2 ring-emerald-500 border-emerald-400 bg-emerald-50/50",
      },
      {
        title: "INACTIVE PRODUCTS",
        value: inactiveCount,
        filterKey: "inactive",
        icon: XCircle,
        colorClass: "text-rose-600 bg-rose-50 border-rose-100",
        activeClass: "ring-2 ring-emerald-500 border-emerald-400 bg-rose-50/50",
      },
      {
        title: "LOW STOCK ITEMS",
        value: lowStockCount,
        filterKey: "low_stock",
        icon: TriangleAlert,
        colorClass: "text-amber-600 bg-amber-50 border-amber-100",
        activeClass: "ring-2 ring-emerald-500 border-emerald-400 bg-amber-50/50",
      },
    ];
  }, [products]);

  return (
    <div className="min-h-screen">
      <Toast message={toast} type={toastType} />

      {/* Interactive Stat Cards Section */}
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">
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
                placeholder="Search by category or product name ..."
                className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm bg-transparent cursor-text focus:outline-none focus:border-[#10B981] focus:ring-4 focus:ring-[#10B981]/15 transition"
              />
            </div>
            
          </div>

          {/* Right Side: Entries Dropdown and Add New Product Button */}
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
              <Plus size={18} /> Add New Product
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-emerald-700 border-b border-emerald-800 text-white text-xs font-semibold uppercase">
                <th className="p-4">Barcode</th>
                <th className="p-4">Name</th>
                <th className="p-4">Price</th>
                <th className="p-4">Sale Price</th>
                <th className="p-4">Stock Qty</th>
                <th className="p-4">Min Stock Level</th>
                <th className="p-4 w-32">Discount (%)</th>
                <th className="p-4 w-32">Discount Amount</th>
                <th className="p-4 w-28">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading && (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
                    Loading products...
                  </td>
                </tr>
              )}
              {!loading && filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-400">
                    No products found under this view.
                  </td>
                </tr>
              )}
              {!loading &&
                paginatedProducts.map((prod) => {
                  const isInactive = prod.status === "inactive";
                  const isLowStock = prod.stock_quantity <= prod.min_stock_level;
                  const salePrice = getSalePrice(prod);
                  const discountFloor = getDiscountFloor(prod);
                  return (
                    <tr
                      key={prod.product_id}
                      className={`hover:bg-slate-50 transition ${
                        isInactive ? "bg-slate-100/50 opacity-75" : ""
                      }`}
                    >
                      <td className="p-4 font-mono text-xs text-slate-500">
                        #{prod.barcode}
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-slate-880">
                          {prod.product_name}
                        </div>
                        <div className="text-xs text-slate-400">
                          {getCategoryName(prod.category_id)}
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-slate-800">
                        {Number(prod.price).toLocaleString()}K
                      </td>
                      <td className="p-4 font-semibold text-emerald-700">
                        {salePrice.toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })}K
                      </td>
                      <td className="p-4">
                        <span
                          className={`font-bold ${
                            isLowStock ? "text-rose-600" : "text-slate-700"
                          }`}
                        >
                          {prod.stock_quantity}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500 font-semibold">
                        {prod.min_stock_level}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-1">
                          <input
                            type="number"
                            step="1"
                            min={discountFloor}
                            max="100"
                            defaultValue={prod.discount_rate}
                            onBlur={(e) =>
                              handleDiscountChange(
                                prod.product_id,
                                e.target.value
                              )
                            }
                            className="w-16 p-1 text-center border border-slate-200 rounded text-xs font-bold text-slate-700 focus:ring-1 focus:ring-emerald-500 focus:outline-none bg-white"
                          />
                          <span className="text-xs text-slate-400">%</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">
                          Min {discountFloor}%
                        </p>
                        {discountError[prod.product_id] && (
                          <p className="text-[10px] text-rose-600 mt-1">
                            {discountError[prod.product_id]}
                          </p>
                        )}
                      </td>
                      <td className="p-4 font-semibold text-slate-700">
                        {Number(prod.discount_price || 0).toLocaleString()}K
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
                          {!isInactive && (
                            <button
                              onClick={() => setEditProductId(prod.product_id)}
                              className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-sky-500 hover:bg-sky-600 transition cursor-pointer"
                            >
                              Edit
                            </button>
                          )}
                          {isInactive ? (
                            <button
                              onClick={() =>
                                askConfirm("restore", prod.product_id, prod.product_name)
                              }
                              className="px-8 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-700 border border-emerald-200 hover:bg-emerald-900 transition flex items-center gap-1 cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              Restore
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                askConfirm("delete", prod.product_id, prod.product_name)
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
        <AddProduct
          existingProductNames={products.map((p) => p.product_name)}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchData();
            showToast("Product added successfully");
          }}
        />
      </Modal>

      <Modal isOpen={!!editProductId} onClose={() => setEditProductId(null)} maxWidth="max-w-lg">
        <EditProduct
          productId={editProductId}
          existingProductNames={products
            .filter((p) => p.product_id !== editProductId)
            .map((p) => p.product_name)}
          onClose={() => setEditProductId(null)}
          onSuccess={() => {
            setEditProductId(null);
            fetchData();
            showToast("Product updated successfully");
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
            ? "This product will become active again and visible on the cashier screen."
            : "This product will be hidden from the cashier screen. You can restore it anytime."
        }
        confirmLabel={confirmState?.type === "restore" ? "Restore" : "Delete"}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmState(null)}
      />
    </div>
  );
};

export default ProductsView;