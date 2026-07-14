import { useState, useEffect } from "react";
import { X, Loader2, Plus, PackageCheck } from "lucide-react";
import api from "../../../api/axios";
import Modal from "../../../components/common/Modal";
import AddCategory from "../category/AddCategory";

const EditProduct = ({ productId, onClose, onSuccess, existingProductNames = [] }) => {
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [showAddCategory, setShowAddCategory] = useState(false);

  const [barcode, setBarcode] = useState("");
  const [originalBarcode, setOriginalBarcode] = useState("");
  const [name, setName] = useState("");
  const [originalName, setOriginalName] = useState("");
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
    setCategoriesLoading(true);
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
      if (selectId) setCategoryId(String(selectId));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load categories.");
    } finally {
      setCategoriesLoading(false);
    }
  };

  // GET /api/products/:id + GET /api/categories — load the existing product into the form
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setCategoriesLoading(true);
      try {
        const [productRes, categoriesRes] = await Promise.all([
          api.get(`/products/${productId}`),
          api.get("/categories"),
        ]);
        const prod = productRes.data;
        
        // Explicitly cast database numeric values to String to prevent crashes
        setBarcode(String(prod.barcode ?? ""));
        setOriginalBarcode(String(prod.barcode ?? ""));
        setName(String(prod.product_name ?? ""));
        setOriginalName(String(prod.product_name ?? ""));
        setPrice(String(prod.price ?? ""));
        setCategoryId(String(prod.category_id ?? ""));
        setStock(String(prod.stock_quantity ?? ""));
        setMinStock(String(prod.min_stock_level ?? ""));
        setDiscount(String(prod.discount_rate ?? "0.0"));
        
        setCategories(categoriesRes.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load product.");
      } finally {
        setLoading(false);
        setCategoriesLoading(false);
      }
    };
    if (productId) fetchData();
  }, [productId]);

  const clearFieldError = (field) => {
    setFieldErrors((prev) => (prev[field] ? { ...prev, [field]: "" } : prev));
  };

  const isDuplicateName = (value) => {
    const trimmedLower = String(value).trim().toLowerCase();
    if (originalName && trimmedLower === originalName.trim().toLowerCase()) {
      return false;
    }
    return existingProductNames.some((n) => String(n).trim().toLowerCase() === trimmedLower);
  };

  // Manual validation matching your specifications safely
  const validate = () => {
    const errs = {};
    
    if (!String(barcode).trim()) errs.barcode = "Barcode is required.";

    if (!String(name).trim()) {
      errs.name = "Product name is required.";
    } else if (String(name).trim().length > 40) {
      errs.name = "Product name cannot exceed 40 characters.";
    } else if (isDuplicateName(name)) {
      errs.name = "A product with this name already exists.";
    }

    const parsedPrice = parseFloat(price);
    if (price === "" || isNaN(parsedPrice)) {
      errs.price = "Price is required.";
    } else if (parsedPrice < 0) {
      errs.price = "Price cannot be negative.";
    } else if (String(price).length > 10) {
      errs.price = "Price cannot exceed 10 digits.";
    }

    if (!categoryId) errs.categoryId = "Please select a category.";

    const parsedStock = parseInt(stock);
    if (stock === "" || isNaN(parsedStock)) {
      errs.stock = "Stock quantity is required.";
    } else if (parsedStock < 0) {
      errs.stock = "Stock quantity cannot be negative.";
    } else if (String(stock).length > 4) {
      errs.stock = "Stock quantity cannot exceed 4 digits.";
    }

    const parsedMinStock = parseInt(minStock);
    if (minStock === "" || isNaN(parsedMinStock)) {
      errs.minStock = "Min stock level is required.";
    } else if (parsedMinStock < 0) {
      errs.minStock = "Min stock level cannot be negative.";
    } else if (String(minStock).length > 4) {
      errs.minStock = "Min stock level cannot exceed 4 digits.";
    } else if (parsedMinStock >= parsedStock) {
      errs.minStock = "Min stock cannot be equal or greater than stock quantity.";
    }

    const parsedDiscount = parseFloat(discount);
    if (discount === "" || isNaN(parsedDiscount)) {
      errs.discount = "Discount rate is required.";
    } else if (parsedDiscount < 0 || parsedDiscount > 100) {
      errs.discount = "Discount rate must be between 0 and 100.";
    } else if (String(discount).length > 4) {
      errs.discount = "Discount cannot exceed 4 characters.";
    } else if (parsedDiscount < categoryDiscountFloor) {
      errs.discount = `Discount rate cannot be lower than ${categoryDiscountFloor}% for this category.`;
    }
    return errs;
  };

  // Input Change Handlers with Strict MaxLength Slicing
  const handleBarcodeChange = (e) => {
    const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 15);
    setBarcode(digitsOnly);
    clearFieldError("barcode");
    if (error) setError("");
  };

  const handleNameChange = (e) => {
    const value = e.target.value.slice(0, 40);
    setName(value);
    clearFieldError("name");
    if (error) setError("");
  };

  const handlePriceChange = (e) => {
    const value = e.target.value.slice(0, 7);
    setPrice(value);
    clearFieldError("price");
    if (error) setError("");
  };

  const handleStockChange = (e) => {
    const value = e.target.value.slice(0, 4);
    setStock(value);
    clearFieldError("stock");
    if (error) setError("");
  };

  const handleMinStockChange = (e) => {
    const value = e.target.value.slice(0, 4);
    setMinStock(value);
    clearFieldError("minStock");
    if (error) setError("");
  };

  const handleDiscountChange = (e) => {
    const value = e.target.value.slice(0, 3);
    setDiscount(value);
    clearFieldError("discount");
    if (error) setError("");
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
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-semibold text-slate-600">
                    Barcode
                  </label>
                  <span className="text-xs text-slate-400">
                    {barcode.length}/15
                  </span>
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  autoFocus
                  maxLength={15}
                  value={barcode}
                  onChange={handleBarcodeChange}
                  placeholder="e.g. 2001011 (up to 15 digits)"
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
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-semibold text-slate-600">
                    Product Name
                  </label>
                  <span className="text-xs text-slate-400">
                    {name.length}/40
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={40}
                  value={name}
                  onChange={handleNameChange}
                  placeholder="e.g. Ovaltine Pack 10s (max 40 chars)"
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
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-semibold text-slate-600">
                    Price (MMK)
                  </label>
                  <span className="text-xs text-slate-400">
                    {price.length}/10
                  </span>
                </div>
                <input
                  type="number"
                  min="0"
                  maxLength={10}
                  value={price}
                  onChange={handlePriceChange}
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
                      if (Number(discount) < floor) {
                        setDiscount(String(floor).slice(0, 3));
                      }
                      clearFieldError("discount");
                    }
                  }}
                  disabled={categoriesLoading}
                  className={`w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:outline-none bg-white disabled:opacity-60 ${
                    fieldErrors.categoryId
                      ? "border-rose-400 focus:ring-rose-400"
                      : "border-slate-300 focus:ring-emerald-500"
                  }`}
                >
                  {categoriesLoading && <option>Loading...</option>}
                  {!categoriesLoading && categories.length === 0 && (
                    <option value="">No categories available</option>
                  )}
                  {!categoriesLoading &&
                    categories.map((cat) => (
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
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-semibold text-slate-600">
                    Stock Quantity
                  </label>
                  <span className="text-xs text-slate-400">
                    {stock.length}/4
                  </span>
                </div>
                <input
                  type="number"
                  min="0"
                  maxLength={4}
                  value={stock}
                  onChange={handleStockChange}
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
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-semibold text-slate-600">
                    Min Stock Level
                  </label>
                  <span className="text-xs text-slate-400">
                    {minStock.length}/4
                  </span>
                </div>
                <input
                  type="number"
                  min="0"
                  maxLength={4}
                  value={minStock}
                  onChange={handleMinStockChange}
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
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-semibold text-slate-600">
                    Default Discount (%)
                  </label>
                  
                </div>
                <input
                  type="number"
                  step="0.1"
                  min={categoryDiscountFloor}
                  max="100"
                  maxLength={4}
                  value={discount}
                  onChange={handleDiscountChange}
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

      {/* Nested "Add Category" modal */}
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