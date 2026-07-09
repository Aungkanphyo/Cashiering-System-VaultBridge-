import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Reusable pagination footer bar.
 *
 * Shows "Showing X-Y of Z entries" on the left and Previous / page-number /
 * Next controls on the right. Meant to sit directly under a table, inside
 * the same card, as the table's footer.
 *
 * Props:
 * - currentPage: number (1-based)
 * - totalPages: number
 * - totalItems: number (count after filtering, before slicing to a page)
 * - pageSize: number
 * - onPageChange: (page: number) => void
 */
const Pagination = ({ currentPage, totalPages, totalItems, pageSize, onPageChange }) => {
  if (totalItems === 0) {
    return (
      <div className="px-4 py-3 border-t border-slate-200 bg-slate-50/60">
        <p className="text-xs text-slate-500">No entries found.</p>
      </div>
    );
  }

  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalItems);

  // Build a compact page-number list with "..." for large page counts,
  // always keeping the first, last, and pages around the current one.
  const pages = [];
  const windowSize = 1;
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || (p >= currentPage - windowSize && p <= currentPage + windowSize)) {
      pages.push(p);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border-t border-slate-200 bg-slate-50/60">
      <p className="text-xs text-slate-500">
        Showing <span className="font-semibold text-slate-700">{startIndex}-{endIndex}</span> of{" "}
        <span className="font-semibold text-slate-700">{totalItems}</span> entries
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 text-slate-600 hover:bg-slate-100 transition disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Previous
        </button>

        {pages.map((p, idx) =>
          p === "..." ? (
            <span key={`ellipsis-${idx}`} className="px-2 text-xs text-slate-400">
              &hellip;
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={`w-8 h-8 rounded-lg text-xs font-semibold border transition ${
                p === currentPage
                  ? "bg-emerald-600 border-emerald-600 text-white shadow-sm"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 text-slate-600 hover:bg-slate-100 transition disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
        >
          Next
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;