import { useState, useEffect } from "react";
import { X, Loader2, Plus } from "lucide-react";
import api from "../../../api/axios";
import Modal from "../../../components/common/Modal";
import AddCategory from "../category/AddCategory";
import { io } from "socket.io-client";
import { PackagePlus } from 'lucide-react';

const AddProduct = ({ onClose, onSuccess, existingProductNames = [] }) => {
    const [categories, setCategories] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [showAddCategory, setShowAddCategory] = useState(false);

    const [barcode, setBarcode] = useState("");
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [stock, setStock] = useState("");
    const [minStock, setMinStock] = useState("");
    const [discount, setDiscount] = useState("0");
    const [discountTouched, setDiscountTouched] = useState(false);
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});
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
            let chosen = null;
            if (selectId) {
                setCategoryId(String(selectId));
                chosen = res.data.find((c) => String(c.category_id) === String(selectId));
            } else if (res.data.length > 0 && !categoryId) {
                setCategoryId(String(res.data[0].category_id));
                chosen = res.data[0];
            }
            if (chosen && !discountTouched) {
                setDiscount(String(Math.floor(Number(chosen.discount_category || 0))));
            }
        } catch (err) {
            setError(
                err.response?.data?.message || "Failed to load categories."
            );
        } finally {
            setCategoriesLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const clearFieldError = (field) => {
        setFieldErrors((prev) => (prev[field] ? { ...prev, [field]: "" } : prev));
    };

    // Barcode Real-time Scanner Integration
    useEffect(() => {
        const socket = io("http://localhost:5000");

        socket.on("display-barcode", (scannedBarcode) => {
            const digitsOnly = scannedBarcode.trim().replace(/\D/g, "").slice(0, 15);
            setBarcode(digitsOnly);
            clearFieldError("barcode");
            setError("");
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const isDuplicateName = (value) =>
        existingProductNames.some(
            (n) => n.trim().toLowerCase() === value.trim().toLowerCase()
        );

    const validate = () => {
        const errs = {};
        if (!barcode.trim()) errs.barcode = "Barcode is required.";
        
        if (!name.trim()) {
            errs.name = "Product name is required.";
        } else if (name.trim().length > 40) {
            errs.name = "Product name cannot exceed 40 characters.";
        } else if (isDuplicateName(name)) {
            errs.name = "A product with this name already exists.";
        }

        if (price === "" || Number.isNaN(Number(price))) {
            errs.price = "Price is required.";
        } else if (String(price).length > 10) {
            errs.price = "Price cannot exceed 10 digits.";
        }

        if (!categoryId) errs.categoryId = "Please select a category.";

        if (stock === "" || Number.isNaN(Number(stock))) {
            errs.stock = "Stock quantity is required.";
        } else if (String(stock).length > 4) {
            errs.stock = "Stock quantity cannot exceed 4 digits.";
        }

        if (minStock === "" || Number.isNaN(Number(minStock))) {
            errs.minStock = "Min stock level is required.";
        } else if (String(minStock).length > 4) {
            errs.minStock = "Min stock level cannot exceed 4 digits.";
        } else if (Number(minStock) >= Number(stock)) {
            errs.minStock = "Min stock cannot be equal or greater than stock quantity.";
        }

        if (discount === "" || Number.isNaN(Number(discount))) {
            errs.discount = "Discount rate is required.";
        } else if (Number(discount) > 100) {
            errs.discount = "Discount rate must be between 0 and 100.";
        } else if (Number(discount) < categoryDiscountFloor) {
            errs.discount = `Discount rate cannot be lower than ${categoryDiscountFloor}% for this category.`;
        }
        return errs;
    };

    // Strict Digit-Only Sanitization (\D targets all non-digits)
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
        const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 10);
        setPrice(digitsOnly);
        clearFieldError("price");
        if (error) setError("");
    };

    // STRICT: Only digits allowed for Stock Quantity
    const handleStockChange = (e) => {
        const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 4);
        setStock(digitsOnly);
        clearFieldError("stock");
        if (error) setError("");
    };

    // STRICT: Only digits allowed for Min Stock Level
    const handleMinStockChange = (e) => {
        const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 4);
        setMinStock(digitsOnly);
        clearFieldError("minStock");
        if (error) setError("");
    };

    // STANDARD: Back to standard value handling for discount rate
    const handleDiscountChange = (e) => {
        setDiscount(e.target.value);
        setDiscountTouched(true);
        clearFieldError("discount");
        if (error) setError("");
    };

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
            await api.post("/products", {
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
                    "Failed to save product. Please try again."
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
                        <PackagePlus className="text-white" size={28} />
                        <h3 className="font-bold text-white text-lg">Add New Product</h3>
                    </div>
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="text-white/80 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

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
                                className={`w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:outline-none ${fieldErrors.barcode
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
                                className={`w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:outline-none ${fieldErrors.name
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
                                type="text"
                                inputMode="numeric"
                                value={price}
                                onChange={handlePriceChange}
                                placeholder="e.g. 5000"
                                className={`w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:outline-none ${fieldErrors.price
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
                                        if (!discountTouched || Number(discount) < floor) {
                                            setDiscount(String(Math.floor(floor)));
                                        }
                                        clearFieldError("discount");
                                    }
                                }}
                                disabled={categoriesLoading}
                                className={`w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:outline-none bg-white disabled:opacity-60 ${fieldErrors.categoryId
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

                        {/* STRICT DIGITAL ENFORCEMENT */}
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
                                type="text"
                                inputMode="numeric"
                                value={stock}
                                onChange={handleStockChange}
                                placeholder="e.g. 50"
                                className={`w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:outline-none ${fieldErrors.stock
                                    ? "border-rose-400 focus:ring-rose-400"
                                    : "border-slate-300 focus:ring-emerald-500"
                                    }`}
                            />
                            {fieldErrors.stock && (
                                <p className="text-xs text-rose-600 mt-1">{fieldErrors.stock}</p>
                            )}
                        </div>

                        {/* STRICT DIGITAL ENFORCEMENT */}
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
                                type="text"
                                inputMode="numeric"
                                value={minStock}
                                onChange={handleMinStockChange}
                                placeholder="e.g. 10"
                                className={`w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:outline-none ${fieldErrors.minStock
                                    ? "border-rose-400 focus:ring-rose-400"
                                    : "border-slate-300 focus:ring-emerald-500"
                                    }`}
                            />
                            {fieldErrors.minStock && (
                                <p className="text-xs text-rose-600 mt-1">{fieldErrors.minStock}</p>
                            )}
                        </div>

                        {/* STANDARD NUMBER FIELD FOR DISCOUNT */}
                        <div className="col-span-2">
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-semibold text-slate-600">
                                    Default Discount (%)
                                </label>
                            </div>
                            <input
                                type="number"
                                min={categoryDiscountFloor}
                                max="100"
                                value={discount}
                                onChange={handleDiscountChange}
                                className={`w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:outline-none ${fieldErrors.discount
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
                            {submitting ? "Saving..." : "Save Product"}
                        </button>
                    </div>
                </form>
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

export default AddProduct;