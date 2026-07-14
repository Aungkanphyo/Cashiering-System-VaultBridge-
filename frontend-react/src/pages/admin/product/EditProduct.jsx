import { useState, useEffect } from "react";
import { X, Loader2, Plus, PackageCheck } from "lucide-react";
import api from "../../../api/axios";
import Modal from "../../../components/common/Modal";
import AddCategory from "../category/AddCategory";

const EditProduct = ({ productId, onClose, onSuccess, existingProductNames = [] }) => {
  const [categories, setCategories] = useState([]);
  const [showAddCategory, setShowAddCategory] = useState(false);

  const [barcode, setBarcode] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [stock, setStock] = useState("");
  const [minStock, setMinStock] = useState("");
  const [discount, setDiscount] = useState("0.0");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // The selected category carries the tax rate and the minimum (floor) discount
  // that this product cannot go below.
  const selectedCategory = categories.find(
    (c) => String(c.category_id) === String(categoryId)
  );
  const categoryTax = selectedCategory ? Number(selectedCategory.tax || 0) : 0;
  const categoryDiscountFloor = selectedCategory
    ? Number(selectedCategory.discount_category || 0)
    : 0;
  const previewPrice = Number(price) || 0;
  const previewSalePrice = previewPrice + (previewPrice * categoryTax) / 100;

  const fetchCategories = async (selectId) => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
      if (selectId) setCategoryId(String(selectId));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load categories.");
    }
  };

  // GET /api/products/:id + GET /api/categories — load the existing product into the form
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [productRes, categoriesRes] = await Promise.all([
          api.get(`/products/${productId}`),
          api.get("/categories"),
        ]);
        const prod = productRes.data;
        setBarcode(prod.barcode);
        setName(prod.product_name);
        setPrice(String(prod.price));
        setCategoryId(String(prod.category_id));
        setStock(String(prod.stock_quantity));
        setMinStock(String(prod.min_stock_level));
        setDiscount(String(prod.discount_rate ?? 0.0));
        setCategories(categoriesRes.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load product.");
      } finally {
        setLoading(false);
      }
    };
    if (productId) fetchData();
  }, [productId]);

  const clearFieldError = (field) => {
    setFieldErrors((prev) => (prev[field] ? { ...prev, [field]: "" } : prev));
  };

  const isDuplicateName = (value) =>
    existingProductNames.some(
      (n) => n.trim().toLowerCase() === value.trim().toLowerCase()
    );

  // Manual validation — replaces native "required" popups with inline messages
  const validate = () => {
    const errs = {};
    if (!barcode.trim()) errs.barcode = "Barcode is required.";
    if (!name.trim()) {
      errs.name = "Product name is required.";
    } else if (isDuplicateName(name)) {
      errs.name = "A product with this name already exists.";
    }
    if (price === "" || Number.isNaN(Number(price))) {
      errs.price = "Price is required.";
    } else if (Number(price) < 0) {
      errs.price = "Price cannot be negative.";
    }
    if (!categoryId) errs.categoryId = "Please select a category.";
    if (stock === "" || Number.isNaN(Number(stock))) {
      errs.stock = "Stock quantity is required.";
    } else if (Number(stock) < 0) {
      errs.stock = "Stock quantity cannot be negative.";
    }
    if (minStock === "" || Number.isNaN(Number(minStock))) {
      errs.minStock = "Min stock level is required.";
    } else if (Number(minStock) < 0) {
      errs.minStock = "Min stock level cannot be negative.";
    }
    if (discount === "" || Number.isNaN(Number(discount))) {
      errs.discount = "Discount rate is required.";
    } else if (Number(discount) < 0 || Number(discount) > 100) {
      errs.discount = "Discount rate must be between 0 and 100.";
    } else if (Number(discount) < categoryDiscountFloor) {
      errs.discount = `Discount rate cannot be lower than ${categoryDiscountFloor}% for this category.`;
    }
    return errs;
  };

  // PUT /api/products/:id
  const handleSubmit = async (e) => {
    e.preventDefault();

    const errs = validate();
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) {
      setError("Please fix the highlighted fields.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await api.put(`/products/${productId}`, {
        barcode: barcode.trim(),
        product_name: name.trim(),
        price: parseFloat(price) || 0,
        category_id: parseInt(categoryId),
        stock_quantity: parseInt(stock) || 0,
        min_stock_level: parseInt(minStock) || 0,
        discount_rate: parseFloat(discount) || 0,
      });
      onSuccess?.();
    } catch (err) {
      if (err.response?.status === 422 && err.response.data?.errors?.product_name) {
        setFieldErrors((prev) => ({
          ...prev,
          name: "A product with this name already exists.",
        }));
        setError("Please fix the highlighted fields.");
      } else if (err.response?.status === 422 && err.response.data?.errors?.barcode) {
        setFieldErrors((prev) => ({
          ...prev,
          barcode: "This barcode is already used by another product.",
        }));
        setError("Please fix the highlighted fields.");
      } else {
        setError(
          err.response?.data?.message ||
            "Failed to update product. Please try again."
        );
      }
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (submitting) return;
    onClose?.();
  };

  return (
    <>
      <div
        className={`bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full ${
          showAddCategory ? "hidden" : ""
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-emerald-700 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <PackageCheck className="text-white" size={28} />
            <h3 className="font-bold text-white text-lg">Edit Product Profile</h3>
          </div>
          <button
            type="button"
            onClick={handleCancel}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="p-10 flex items-center justify-center text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Loading product...
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-slate-600 mb-1">
                  Barcode
                </label>
                <input
                  type="text"
                  autoFocus
                  value={barcode}
                  onChange={(e) => {
                    setBarcode(e.target.value);
                    clearFieldError("barcode");
                    if (error) setError("");
                  }}
                  placeholder="e.g. #2001011"
                  className={`w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:outline-none ${
                    fieldErrors.barcode
                      ? "border-rose-400 focus:ring-rose-400"
                      : "border-slate-300 focus:ring-emerald-500"
                  }`}
                />
                {fieldErrors.barcode && (
                  <p className="text-xs text-rose-600 mt-1">{fieldErrors.barcode}</p>
                )}
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-semibold text-slate-600 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    clearFieldError("name");
                    if (error) setError("");
                  }}
                  placeholder="e.g. Ovaltine Pack 10s"
                  className={`w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:outline-none ${
                    fieldErrors.name
                      ? "border-rose-400 focus:ring-rose-400"
                      : "border-slate-300 focus:ring-emerald-500"
                  }`}
                />
                {fieldErrors.name && (
                  <p className="text-xs text-rose-600 mt-1">{fieldErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">
                  Price (MMK)
                </label>
                <input
                  type="number"
                  min="0"
                  value={price}
                  onChange={(e) => {
                    setPrice(e.target.value);
                    clearFieldError("price");
                  }}
                  placeholder="e.g. 5000"
                  className={`w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:outline-none ${
                    fieldErrors.price
                      ? "border-rose-400 focus:ring-rose-400"
                      : "border-slate-300 focus:ring-emerald-500"
                  }`}
                />
                {fieldErrors.price && (
                  <p className="text-xs text-rose-600 mt-1">{fieldErrors.price}</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-semibold text-slate-600">
                    Category
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAddCategory(true)}
                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 flex items-center gap-0.5"
                  >
                    <Plus className="w-3 h-3" />
                    Add Category
                  </button>
                </div>
                <select
                  value={categoryId}
                  onChange={(e) => {
                    const newCategoryId = e.target.value;
                    setCategoryId(newCategoryId);
                    clearFieldError("categoryId");
                    const newCategory = categories.find(
                      (c) => String(c.category_id) === String(newCategoryId)
                    );
                    if (newCategory) {
                      const floor = Number(newCategory.discount_category || 0);
                      // Bump the discount up to the new category's floor if the
                      // current value would now be below it.
                      if (Number(discount) < floor) {
                        setDiscount(String(floor));
                      }
                      clearFieldError("discount");
                    }
                  }}
                  className={`w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:outline-none bg-white ${
                    fieldErrors.categoryId
                      ? "border-rose-400 focus:ring-rose-400"
                      : "border-slate-300 focus:ring-emerald-500"
                  }`}
                >
                  {categories.map((cat) => (
                    <option key={cat.category_id} value={cat.category_id}>
                      {cat.category_name}
                    </option>
                  ))}
                </select>
                {fieldErrors.categoryId && (
                  <p className="text-xs text-rose-600 mt-1">{fieldErrors.categoryId}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) => {
                    setStock(e.target.value);
                    clearFieldError("stock");
                  }}
                  placeholder="e.g. 50"
                  className={`w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:outline-none ${
                    fieldErrors.stock
                      ? "border-rose-400 focus:ring-rose-400"
                      : "border-slate-300 focus:ring-emerald-500"
                  }`}
                />
                {fieldErrors.stock && (
                  <p className="text-xs text-rose-600 mt-1">{fieldErrors.stock}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">
                  Min Stock Level
                </label>
                <input
                  type="number"
                  min="0"
                  value={minStock}
                  onChange={(e) => {
                    setMinStock(e.target.value);
                    clearFieldError("minStock");
                  }}
                  placeholder="e.g. 10"
                  className={`w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:outline-none ${
                    fieldErrors.minStock
                      ? "border-rose-400 focus:ring-rose-400"
                      : "border-slate-300 focus:ring-emerald-500"
                  }`}
                />
                {fieldErrors.minStock && (
                  <p className="text-xs text-rose-600 mt-1">{fieldErrors.minStock}</p>
                )}
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-semibold text-slate-600 mb-1">
                  Default Discount (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min={categoryDiscountFloor}
                  max="100"
                  value={discount}
                  onChange={(e) => {
                    setDiscount(e.target.value);
                    clearFieldError("discount");
                  }}
                  className={`w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:outline-none ${
                    fieldErrors.discount
                      ? "border-rose-400 focus:ring-rose-400"
                      : "border-slate-300 focus:ring-emerald-500"
                  }`}
                />
                {fieldErrors.discount ? (
                  <p className="text-xs text-rose-600 mt-1">{fieldErrors.discount}</p>
                ) : (
                  <p className="text-xs text-slate-400 mt-1">
                    Must be between {categoryDiscountFloor}% (category minimum) and 100%.
                  </p>
                )}
              </div>

              {selectedCategory && (
                <div className="col-span-2 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-500 flex justify-between">
                  <span>
                    Category tax: <strong className="text-slate-700">{categoryTax}%</strong>
                  </span>
                  <span>
                    Sale price (price + tax):{" "}
                    <strong className="text-slate-700">
                      {previewSalePrice.toLocaleString(undefined, { maximumFractionDigits: 2 })} MMK
                    </strong>
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-1">
              <button
                type="button"
                onClick={handleCancel}
                disabled={submitting}
                className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700 bg-slate-100 rounded-lg disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg shadow-sm flex items-center gap-1.5 disabled:opacity-60"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {submitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Nested "Add Category" modal — a sibling now, so it still renders
          (and stays visible) even while the EditProduct card above is hidden */}
      <Modal isOpen={showAddCategory} onClose={() => setShowAddCategory(false)} maxWidth="max-w-lg">
        <AddCategory
          existingCategoryNames={categories.map((c) => c.category_name)}
          onClose={() => setShowAddCategory(false)}
          onSuccess={(newCategory) => {
            setShowAddCategory(false);
            fetchCategories(newCategory?.category_id);
          }}
        />
      </Modal>
    </>
  );
};

export default EditProduct;