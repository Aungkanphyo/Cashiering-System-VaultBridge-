import { Trash2, RotateCcw } from "lucide-react";
import Modal from "./Modal";

/**
 * Reusable confirmation dialog (custom modal box) used instead of the
 * browser's native window.confirm() popup.
 *
 * Visual style matches the app's "Are you sure you want to log out?" popup:
 * centered icon in a soft circle, bold title, muted subtitle, and two
 * equal-width pill buttons side by side.
 *
 * Props:
 * - isOpen: boolean
 * - title: string
 * - message: string
 * - confirmLabel / cancelLabel: string
 * - tone: "danger" | "success" (controls the icon + confirm button color)
 * - onConfirm / onCancel: callbacks
 */
const ConfirmDialog = ({
  isOpen,
  title = "Are you sure?",
  message = "",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "danger",
  onConfirm,
  onCancel,
}) => {
  const isSuccess = tone === "success";
  const Icon = isSuccess ? RotateCcw : Trash2;

  return (
    <Modal isOpen={isOpen} onClose={onCancel} maxWidth="max-w-sm">
      <div className="bg-white rounded-2xl p-6 shadow-2xl text-center transform transition-all scale-100">
        <div
          className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 border ${
            isSuccess
              ? "bg-emerald-50 text-emerald-600 border-emerald-100"
              : "bg-red-50 text-red-600 border-red-100"
          }`}
        >
          <Icon className="w-6 h-6" />
        </div>

        <h3 className="text-gray-900 text-lg font-bold mb-2">{title}</h3>
        {message && (
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">{message}</p>
        )}

        <div className="flex gap-3 justify-center">
          {/* Cancel Button */}
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition"
          >
            {cancelLabel}
          </button>
          {/* Confirm Button */}
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 py-2.5 text-white text-sm font-semibold rounded-xl shadow-sm transition ${
              isSuccess
                ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200"
                : "bg-red-600 hover:bg-red-700 shadow-red-200"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;