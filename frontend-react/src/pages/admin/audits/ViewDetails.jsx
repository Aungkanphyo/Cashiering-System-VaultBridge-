import React from "react";
import { X, FileText, AlertOctagon } from "lucide-react";

const ViewDetails = ({ transaction, onClose }) => {
  if (!transaction) return null;

  const items = transaction.items || [];
  const isVoided = transaction.status?.toUpperCase() === "VOIDED";
  const voidReason = transaction.void_reason || transaction.voidReason;

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full flex flex-col max-h-[90vh]">
      {/* Header - Adapts dynamically based on status matching your design */}
      <div className={`p-6 border-b border-slate-100 flex items-center justify-between rounded-t-2xl shrink-0 ${isVoided ? "bg-rose-700" : "bg-emerald-700"}`}>
        <div className="flex items-center gap-3 min-w-0">
          {isVoided ? (
            <AlertOctagon className="text-white shrink-0" size={28} />
          ) : (
            <FileText className="text-white shrink-0" size={28} />
          )}
          <div className="min-w-0">
            <h3 className="font-bold text-white text-lg leading-tight truncate">
              Voucher Detail
            </h3>
            <p className="text-xs text-white/70 font-medium mt-0.5 font-mono truncate">
              {transaction.id} | {transaction.dateTime}
            </p>
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 cursor-pointer" />
          </button>
        )}
      </div>

      {/* Body Details */}
      <div className="p-5 space-y-4 text-sm text-slate-800 overflow-y-auto">
        
        {/* Status Indicator */}
        <div>
          <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Transaction Status</span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded w-max mt-0.5 block ${isVoided ? "text-rose-700 bg-rose-50" : "text-emerald-700 bg-emerald-50"}`}>
            {transaction.status || "-"}
          </span>
        </div>

        {/* Purchase Line Items Table */}
        <div>
          <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Purchase Line Items</span>
          <div className="border border-slate-200 rounded-xl overflow-hidden mt-1">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <th className="py-2.5 px-3">Product Name</th>
                  <th className="py-2.5 px-2 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {items.length > 0 ? (
                  items.map((item, index) => (
                    <tr key={`item-${index}`} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-slate-800 break-words max-w-[160px]">
                        {item.name}
                        {item.discount > 0 && (
                          <span className="block text-[10px] text-rose-500 font-normal font-mono">
                            Disc: {item.discount}% (Unit: {(item.unitPrice || 0).toLocaleString()})
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono text-slate-500">{item.qty}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800">
                        {(item.subTotal || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="text-center py-6 text-slate-400">
                      No items found in this voucher.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pricing Breakdown Card */}
        <div>
          <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Voucher Summary</span>
          <div className="font-medium text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 mt-1 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Subtotal:</span>
              <span className="font-mono font-semibold text-slate-800">
                {(transaction.subtotal || 0).toLocaleString()} Ks
              </span>
            </div>
            {transaction.totalDiscount > 0 && (
              <div className="flex justify-between text-rose-600 font-semibold">
                <span>(-) Total Discount:</span>
                <span className="font-mono">-{(transaction.totalDiscount || 0).toLocaleString()} Ks</span>
              </div>
            )}
            <div className="border-t border-dashed border-slate-300 pt-2 flex justify-between items-baseline">
              <span className="text-sm font-bold text-slate-800">Grand Total:</span>
              <span className="text-base font-black text-emerald-700 font-mono">
                {(transaction.finalAmount || 0).toLocaleString()} Ks
              </span>
            </div>
          </div>
        </div>

        {/* Payments Breakdown Card */}
        <div>
          <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Sales Payment Details</span>
          <div className="font-medium text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 mt-1 space-y-1.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-semibold">{transaction.paymentMethod || "Cash"} Received:</span>
              <span className="font-mono font-bold text-slate-800">
                {(transaction.paidAmount || transaction.finalAmount || 0).toLocaleString()} Ks
              </span>
            </div>
            <div className="flex justify-between items-center text-amber-700 font-semibold">
              <span>(-) Change Amount:</span>
              <span className="font-mono font-bold">
                {(transaction.changeAmount || 0).toLocaleString()} Ks
              </span>
            </div>
          </div>
        </div>

        {/* Void Reason Section - Rendered exactly like the total errors breakdown wrapper */}
        {isVoided && voidReason && (
          <div className="pt-4 border-t border-slate-100">
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Void Reason</span>
            <div className="flex flex-col gap-1.5">
              <p className="font-medium text-rose-600 bg-rose-50 p-3 rounded-lg border border-rose-200 mt-1 leading-relaxed break-words text-xs">
                {voidReason}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-end p-5 pt-2 border-t border-slate-50 shrink-0">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-500 hover:bg-slate-200 bg-slate-100 rounded-lg transition-colors cursor-pointer"
        >
          Close Detail
        </button>
      </div>
    </div>
  );
};

export default ViewDetails;