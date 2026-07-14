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
	const [discount, setDiscount] = useState("0.0");
	const [discountTouched, setDiscountTouched] = useState(false);
	const [error, setError] = useState("");
	const [fieldErrors, setFieldErrors] = useState({});
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

	// GET /api/categories — populate the category select
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
			// Default the discount to the newly selected category's discount, as
			// long as the user hasn't typed a custom discount already.
			if (chosen && !discountTouched) {
				setDiscount(String(Number(chosen.discount_category || 0)));
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
		// eslint-disable-next-line react-hooks/exhaustive-deps
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
	}, [])

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

	// Barcode Input Change Handlers
	const handleBarcodeChange = (e) => {
		const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 15);
		setBarcode(digitsOnly);
		clearFieldError("barcode");
		if (error) setError("");
	};

	// POST /api/products
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

					{/* Left Side Group: Icon and Heading */}
					<div className="flex items-center gap-3">
						<PackagePlus className="text-white" size={28} />
						<h3 className="font-bold text-white text-lg">Add New Product</h3>
					</div>

					{/* Right Side Group: Close Button */}
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
							<label className="block text-sm font-semibold text-slate-600 mb-1">
								Barcode
							</label>
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
										// Bump the discount up to the new category's floor if the
										// current value would now be below it.
										if (!discountTouched || Number(discount) < floor) {
											setDiscount(String(floor));
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
								className={`w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:outline-none ${fieldErrors.stock
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
								className={`w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:outline-none ${fieldErrors.minStock
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
									setDiscountTouched(true);
									clearFieldError("discount");
								}}
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

			{/* Nested "Add Category" modal — a sibling now, so it still renders
			    (and stays visible) even while the AddProduct card above is hidden */}
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