import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import api from "../../../api/axios";

const EditPayment = ({ paymentId, onClose, onSuccess, existingPaymentNames = [] }) => {
  const [name, setName] = useState("");
  const [status, setStatus] = useState("active");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // GET /api/payment-methods/:id — load the existing record into the form
  useEffect(() => {
    const fetchPaymentMethod = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/payment-methods/${paymentId}`);
        setName(res.data.payment_name);
        setStatus(res.data.status);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load payment method."
        );
      } finally {
        setLoading(false);
      }
    };
    if (paymentId) fetchPaymentMethod();
  }, [paymentId]);

  const clearFieldError = (field) => {
    setFieldErrors((prev) => (prev[field] ? { ...prev, [field]: "" } : prev));
  };

  const isDuplicateName = (value) =>
    existingPaymentNames.some(
      (n) => n.trim().toLowerCase() === value.trim().toLowerCase()
    );

  const validate = () => {
    const errs = {};
    if (!name.trim()) {
      errs.name = "Payment method name is required.";
    } else if (isDuplicateName(name)) {
      errs.name = "A payment method with this name already exists.";
    }
    return errs;
  };

  // PUT /api/payment-methods/:id
  // Note: status is not editable here — it is controlled only from the
  // Delete / Restore actions on the Payment Methods view page.
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
      await api.put(`/payment-methods/${paymentId}`, {
        payment_name: name.trim(),
      });
      onSuccess?.();
    } catch (err) {
      if (err.response?.status === 422 && err.response.data?.errors?.payment_name) {
        setFieldErrors((prev) => ({
          ...prev,
          name: "A payment method with this name already exists.",
        }));
        setError("Please fix the highlighted fields.");
      } else {
        setError(
          err.response?.data?.message ||
          "Failed to update payment method. Please try again."
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
    <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-emerald-600 to-emerald-500">
        <h3 className="font-bold text-white text-lg">Edit Payment Method</h3>
        <button
          type="button"
          onClick={handleCancel}
          className="text-white/80 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {loading ? (
        <div className="p-10 flex items-center justify-center text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Loading payment method...
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-slate-600 mb-1">
                Payment Method Name
              </label>
              <input
                type="text"
                autoFocus
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  clearFieldError("name");
                  if (error) setError("");
                }}
                placeholder="e.g. AYAPay, CB Pay, WavePay"
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

        
          </div>

          <div className="flex justify-end space-x-3 pt-4">
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
              className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm flex items-center gap-1.5 disabled:opacity-60"
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

export default EditPayment;
