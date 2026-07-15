import { useState, useEffect, useMemo } from "react";
import { Plus, Loader2, RotateCcw, Search } from "lucide-react";
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
    const [statusFilter, setStatusFilter] = useState("all"); // all | active | inactive
    const [search, setSearch] = useState("");
    const [confirmState, setConfirmState] = useState(null); // { type: 'delete'|'restore', id, name }
    const [pageSize, setPageSize] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        if (window.Echo) {
            window.Echo.private('admin.dashboard')
                .listen('.SaleProcessed', (data) => {
                    // data.updatedProducts will contain the reduced product_id and stock_quantity
                    setProducts((prevProducts) => {
                        return prevProducts.map((p) => {
                            const match = data.updatedProducts.find(
                                (up) => Number(up.product_id) === Number(p.product_id)
                            );
                            // Real-time update of stock quantity if a matching product is available
                            return match ? { ...p, stock_quantity: match.stock_quantity } : p;
                        });
                    });
                });
        }

        return () => {
            if (window.Echo) {
                window.Echo.leaveChannel('admin.dashboard');
            }
        };
    }, []);

    const showToast = (message, type = "success") => {
        setToast(message);
        setToastType(type);
        setTimeout(() => setToast(""), 2500);
    };

    // GET /api/products + GET /api/categories (to resolve category names)
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

    // sale price = price + category tax (tax applied on top of the base price)
    const getSalePrice = (product) => {
        const cat = getCategory(product.category_id);
        const tax = cat ? Number(cat.tax || 0) : 0;
        const price = Number(product.price || 0);
        return price + (price * tax) / 100;
    };

    // The discount rate for a product can never go below its category's own
    // discount (discount_category), but can be raised up to 100%.
    const getDiscountFloor = (product) => {
        const cat = getCategory(product.category_id);
        return cat ? Number(cat.discount_category || 0) : 0;
    };

    const filteredProducts = useMemo(() => {
        let list = products;
        if (statusFilter !== "all") {
            list = list.filter((p) => p.status === statusFilter);
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [products, categories, statusFilter, search]);

    // Reset back to page 1 whenever the filter, search term, or page size changes
    useEffect(() => {
        setCurrentPage(1);
    }, [statusFilter, search, pageSize]);

    const totalItems = filteredProducts.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

    // Keep currentPage valid if the list shrinks (e.g. after a delete)
    useEffect(() => {
        if (currentPage > totalPages) setCurrentPage(totalPages);
    }, [totalPages, currentPage]);

    const paginatedProducts = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredProducts.slice(start, start + pageSize);
    }, [filteredProducts, currentPage, pageSize]);

    // PUT /api/products/:id (quick-edit discount rate from the table)
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

    // Opens the custom confirmation box (used for both Delete and Restore)
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
                                placeholder="Search by category or product name ..."
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
                            <span>Add New Product</span>
                        </button>
                    </div>
                </div>
            </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-emerald-700 border-b border-emerald-800 text-white text-xs font-semibold uppercase">
                <th className="p-4">Barcode</th>
                <th className="p-4">Name</th>
                <th className="p-4">Price (MMK)</th>
                <th className="p-4">
                  Sale Price (MMK){" "}
                  <span className="text-[10px] text-emerald-200">
                    (Price + Tax)
                  </span>
                </th>
                <th className="p-4">Stock Qty</th>
                <th className="p-4">Min Stock Level</th>
                <th className="p-4 w-32">
                  Discount (%){" "}
                  <span className="text-[10px] text-emerald-200">
                    (Quick Edit)
                  </span>
                </th>
                <th className="p-4 w-32">Discount Amount (MMK)</th>
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
                    No products found.
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
                        <div className="font-semibold text-slate-800">
                          {prod.product_name}
                        </div>
                        <div className="text-xs text-slate-400">
                          {getCategoryName(prod.category_id)}
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-slate-800">
                        {Number(prod.price).toLocaleString()}
                      </td>
                      <td className="p-4 font-semibold text-emerald-700">
                        {salePrice.toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })}
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
                        {prod.min_stock_level} (Units)
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
                        {Number(prod.discount_price || 0).toLocaleString()}
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
                              onClick={() => setEditProductId(prod.product_id)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition"
                            >
                              Edit
                            </button>
                          )}
                          {isInactive ? (
                            <button
                              onClick={() =>
                                askConfirm("restore", prod.product_id, prod.product_name)
                              }
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition flex items-center gap-1"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              Restore
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                askConfirm("delete", prod.product_id, prod.product_name)
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
        </div>

                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                />
            </div>

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
        </section>
    );
};

export default ProductsView;