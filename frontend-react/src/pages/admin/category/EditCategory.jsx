import { useState, useEffect } from "react";
import { X, Loader2, Tag } from "lucide-react";
import api from "../../../api/axios";

const EditCategory = ({ categoryId, onClose, onSuccess, existingCategoryNames = [] }) => {
  const [name, setName] = useState("");
  const [tax, setTax] = useState("5.0");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [discount, setDiscount] = useState("5.0");
  const [submitting, setSubmitting] = useState(false);

  // GET /api/categories/:id — load the existing category into the form
  useEffect(() => {
    const fetchCategory = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/categories/${categoryId}`);
        setName(res.data.category_name);
        setTax(String(res.data.tax ?? 5.0));
        setDiscount(String(res.data.discount_category ?? 5.0));
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load category."
        );
      } finally {
        setLoading(false);
      }
    };
    if (categoryId) fetchCategory();
  }, [categoryId]);

  const clearFieldError = (field) => {
    setFieldErrors((prev) => (prev[field] ? { ...prev, [field]: "" } : prev));
  };

  const isDuplicateName = (value) =>
    existingCategoryNames.some(
      (n) => n.trim().toLowerCase() === value.trim().toLowerCase()
    );

  const validate = () => {
    const errs = {};
    if (!name.trim()) {
      errs.name = "Category name is required.";
    } else if (isDuplicateName(name)) {
      errs.name = "A category with this name already exists.";
    }
    if (tax === "" || Number.isNaN(Number(tax))) {
      errs.tax = "Tax rate is required.";
    }
    else if (Number(tax) < 0 || Number(tax) > 100) {
      errs.tax = "Tax rate must be between 0 and 100.";
    }
    if (discount === "" || Number.isNaN(Number(discount))) {
      errs.discount = "Discount rate is required.";
    } else if (Number(discount) < 0 || Number(discount) > 100) {
      errs.discount = "Discount rate must be between 0 and 100.";
    }
    return errs;
  };

  // PUT /api/categories/:id
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
      await api.put(`/categories/${categoryId}`, {
        category_name: name.trim(),
        tax: parseFloat(tax) || 0,
        discount_category: discount,
      });
      onSuccess?.();
    } catch (err) {
      if (err.response?.status === 422 && err.response.data?.errors?.category_name) {
        setFieldErrors((prev) => ({
          ...prev,
          name: "A category with this name already exists.",
        }));
        setError("Please fix the highlighted fields.");
      } else {
        setError(
          err.response?.data?.message ||
            "Failed to update category. Please try again."
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
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-emerald-700 rounded-t-2xl">
        <div className="flex items-center gap-3">
          <Tag className="text-white" size={28} />
          <h3 className="font-bold text-white text-lg">Edit Category</h3>
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
          Loading category...
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
         

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-semibold text-slate-600">
                  Category Name
                </label>
                <span className="text-xs text-slate-400">
                  {name.length}/40
                </span>
              </div>
              <input
                type="text"
                autoFocus
                maxLength={40}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  clearFieldError("name");
                  if (error) setError("");
                }}
                placeholder="e.g. Beverages, Snacks"
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
                Tax (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={tax}
                onChange={(e) => {
                  // Restrict input length to max 4 characters (e.g. "100.0")
                  if (e.target.value.length <= 5) {
                    setTax(e.target.value);
                    clearFieldError("tax");
                  }
                }}
                placeholder="e.g. 5.0"
                className={`w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:outline-none ${
                  fieldErrors.tax
                    ? "border-rose-400 focus:ring-rose-400"
                    : "border-slate-300 focus:ring-emerald-500"
                }`}
              />
              {fieldErrors.tax && (
                <p className="text-xs text-rose-600 mt-1">{fieldErrors.tax}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1">
                Discount (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={discount}
                onChange={(e) => {
                  // Restrict input length to max 4 characters (e.g. "100.0")
                  if (e.target.value.length <= 5) {
                    setDiscount(e.target.value);
                    clearFieldError("discount");
                  }
                }}
                placeholder="e.g. 5.0"
                className={`w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:outline-none ${
                  fieldErrors.discount
                    ? "border-rose-400 focus:ring-rose-400"
                    : "border-slate-300 focus:ring-emerald-500"
                }`}
              />
              {fieldErrors.discount && (
                <p className="text-xs text-rose-600 mt-1">{fieldErrors.discount}</p>
              )}
            </div>
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
  );
};

export default EditCategory;