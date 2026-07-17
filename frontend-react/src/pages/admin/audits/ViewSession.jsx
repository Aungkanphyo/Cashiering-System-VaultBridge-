import { useEffect, useState } from "react";
import api from "../../../api/axios";
import toast from "react-hot-toast";
import Pagination from "../../../components/common/Pagination";
import { Search, RotateCcw, User, FileText, Loader2 } from "lucide-react";

const ViewSession = () => {
  // Server-side State Management
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter Controller States
  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const today = new Date().toISOString().split("T")[0];

  // Server-side Pagination States
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);


  useEffect(() => {
    const fetchSessions = async () => {
      setIsLoading(true);
      try {
        const response = await api.get("/admin/cash-sessions", {
          params: {
            page: currentPage,
            search: searchTerm.trim(),
            from_date: fromDate,
            to_date: toDate,
            per_page: pageSize,
          },
        });

        const responseData = response.data.data ? response.data.data : response.data;
        const metaData = response.data.meta ? response.data.meta : response.data;

        setSessions(responseData || []);
        setTotalPages(metaData.last_page || metaData.meta?.last_page || 1);
        setTotalRecords(metaData.total || metaData.meta?.total || 0);
      } catch (err) {
        toast.error("Failed to load register sessions");
      } finally {
        setIsLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchSessions();
    }, 800);

    return () => clearTimeout(delayDebounceFn);
  }, [currentPage, pageSize, searchTerm, fromDate, toDate]);

  const handleReset = () => {
    setSearchTerm("");
    setFromDate("");
    setToDate("");
    setCurrentPage(1);
  };

  // Formats a raw DB timestamp as "YYYY-MM-DD HH:mm:ss"
  const formatRawDatabaseTime = (dateString) => {
    if (!dateString) return "-";
    if (dateString.includes("T")) {
      const [datePart, timePart] = dateString.split("T");
      const cleanTime = timePart.split(".")[0];
      return `${datePart} ${cleanTime}`;
    }
    return dateString;
  };

  return (
    <div className="min-h-screen">
      {/* Filter Panel */}
      <div className="bg-white rounded-2xl border shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Search */}
          <div className="relative w-full sm:w-84">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search cashier by name..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm bg-transparent cursor-text focus:outline-none focus:border-[#10B981] focus:ring-4 focus:ring-[#10B981]/15 transition"
            />
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3 md:ml-auto">
            {/* From */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold text-slate-600">FROM:</label>
              <input type="date" value={fromDate} max={today}
                onChange={(e) => {
                  const value = e.target.value;

                  if (new Date(value) > new Date(today)) {
                    toast.error("From date cannot be greater than today.");
                    return;
                  }

                  if (toDate && new Date(toDate) < new Date(value)) {
                    toast.error("From date cannot be greater than To date. Please select again!");
                    return;
                  }

                  setFromDate(value);
                }}
                className="border rounded-lg px-3 py-2 cursor-text focus:outline-none focus:border-[#10B981] focus:ring-4 focus:ring-[#10B981]/15" />
            </div>

            {/* To */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold text-slate-600">TO:</label>
              <input type="date" value={toDate} min={fromDate || undefined} max={today}
                onChange={(e) => {
                  const value = e.target.value;

                  if (fromDate && new Date(value) < new Date(fromDate)) {
                    toast.error("To date cannot be earlier than From date.");
                    return;
                  }

                  if (new Date(value) > new Date(today)) {
                    toast.error("To date cannot be greater than today.");
                    return;
                  }

                  setToDate(value);
                }}
                className="border rounded-lg px-3 py-2 cursor-text focus:outline-none focus:border-[#10B981] focus:ring-4 focus:ring-[#10B981]/15" />
            </div>

            {/* Reset */}
            <button
              onClick={handleReset}
              className="flex items-center gap-2 rounded-lg bg-red-600 text-white hover:bg-red-700 px-4 py-2 text-sm font-semibold shadow-sm whitespace-nowrap cursor-pointer"
            >
              <RotateCcw size={18} />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden mt-8">
        <div className="flex items-center justify-between gap-4 p-6 pb-4">
          <h2 className="font-bold text-lg text-slate-800">Cash Register Sessions</h2>
          <div className="flex items-center gap-2 text-xs text-slate-500 whitespace-nowrap">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:border-[#10B981] focus:ring-4 focus:ring-[#10B981]/15 cursor-pointer"
            >
              {[8, 10, 15, 20, 25].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <span>entries</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-emerald-700 border-b border-emerald-800 text-white text-xs font-semibold uppercase">
                <th className="p-4">Staff Name</th>
                <th className="p-4">Opening Time</th>
                <th className="p-4">Closing Time</th>
                <th className="p-4">Expected Cash</th>
                <th className="p-4">Actual Cash</th>
                <th className="p-4 text-center">Discrepancy</th>
                <th className="p-4">Report / Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {isLoading && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
                    Loading register sessions...
                  </td>
                </tr>
              )}
              {!isLoading && sessions.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No cash register sessions match the selected filters.
                  </td>
                </tr>
              )}
              {!isLoading &&
                sessions.map((session, idx) => {
                  const isRunning = !session.closing_time;
                  const discrepancy = session.discrepancy;

                  return (
                    <tr key={`${session.session_id}-${idx}`} className="hover:bg-slate-50 transition">
                      <td className="p-4">
                        <div className="flex items-center gap-2.5">
                          <span className="font-semibold text-slate-800 whitespace-nowrap">
                            {session.user?.username || "Unknown Staff"}
                          </span>
                        </div>
                      </td>

                      <td className="p-4 font-semibold text-xs text-slate-800 whitespace-nowrap">
                        {formatRawDatabaseTime(session.opening_time)}
                      </td>

                      <td className="p-4 font-semibold text-xs whitespace-nowrap">
                        {isRunning ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full bg-emerald-100 text-emerald-600 font-bold text-[10px] uppercase tracking-wide">
                            Running
                          </span>
                        ) : (
                          <span className="text-slate-800">{formatRawDatabaseTime(session.closing_time)}</span>
                        )}
                      </td>

                      <td className="p-4 text-start font-semibold text-xs text-slate-800 whitespace-nowrap">
                        {Number(session.expected_closing_cash || 0).toLocaleString()} Ks
                      </td>

                      <td className="p-4 text-start font-semibold text-xs text-slate-800 whitespace-nowrap">
                        {!isRunning && session.actual_closing_cash !== null ? (
                          `${Number(session.actual_closing_cash).toLocaleString()} Ks`
                        ) : (
                          <span className="text-slate-800">-</span>
                        )}
                      </td>

                      <td className="p-4 text-start text-xs font-semibold whitespace-nowrap">
                        {isRunning || discrepancy === null ? (
                          <span className="text-slate-800">-</span>
                        ) : Number(discrepancy) === 0 ? (
                          <span className="text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg text-xs">0</span>
                        ) : Number(discrepancy) > 0 ? (
                          <span className="text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg text-xs">+{Number(discrepancy).toLocaleString()} Ks</span>) :
                          (
                            <span className="text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg text-xs">
                              {Number(discrepancy).toLocaleString()} Ks
                            </span>
                          )}
                      </td>

                      <td className="p-4 max-w-xs text-start text-xs font-semibold">
                        {session.report_text ? (
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 ${Number(discrepancy) > 0
                                ? "bg-blue-50 text-blue-600"
                                : Number(discrepancy) === 0
                                  ? "bg-emerald-50 text-emerald-600"
                                  : "bg-rose-50 text-rose-600"
                              }`}
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span
                              className="truncate max-w-[180px]"
                              title={session.report_text}
                            >
                              {session.report_text}
                            </span>
                          </span>
                        ) : (
                          <span className="inline-flex rounded-lg px-2.5 py-1 text-slate-500">
                            -
                          </span>
                        )}
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
          totalItems={totalRecords}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default ViewSession;