import { useEffect, useState } from "react";
import api from "../../../api/axios";
import Toast from "../../../components/common/Toast";
import Pagination from "../../../components/common/Pagination";
import { Search, RotateCcw, User, FileText, Loader2 } from "lucide-react";

const ViewSession = () => {
  // Server-side State Management
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [toastType, setToastType] = useState("success");

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

  const showToast = (message, type = "success") => {
    setToast(message);
    setToastType(type);
    setTimeout(() => setToast(""), 2500);
  };

  useEffect(() => {
    const fetchSessions = async () => {
      setIsLoading(true);
      try {
        setIsLoading(true);
        setError(null);
 
        const response = await api.get("/admin/cash-sessions", {
          params: {
            page: currentPage,
            search: searchTerm.trim(),
            from_date: fromDate,
            to_date: toDate,
            per_page: pageSize,
          },
        });
 
        // Parse pagination data according to Laravel API response structures
        const responseData = response.data.data ? response.data.data : response.data;
        const metaData = response.data.meta ? response.data.meta : response.data;

        setSessions(responseData || []);
        setTotalPages(metaData.last_page || metaData.meta?.last_page || 1);
        setTotalRecords(metaData.total || metaData.meta?.total || 0);
      } catch (err) {
        showToast(
          err.response?.data?.message || "Failed to load register sessions",
          "error"
        );
      } finally {
        setIsLoading(false);
      }
    };
 
    // Apply debounce mechanism to prevent excessive API calls while typing
    const delayDebounceFn = setTimeout(() => {
      fetchSessions();
    }, 800);

    return () => clearTimeout(delayDebounceFn);
  }, [currentPage, searchTerm, fromDate, toDate]);
 
  const handleReset = () => {
    setSearchTerm("");
    setFromDate("");
    setToDate("");
    setCurrentPage(1);
  };
 
  // Time formatting function to display date and time in Myanmar Standard Time (MMT) format
  const formatRawDatabaseTime = (dateString) => {
    if (!dateString) return "-";
   
   
    if (dateString.includes('T')) {
      const [datePart, timePart] = dateString.split('T');
      const cleanTime = timePart.split('.')[0];
      return `${datePart} ${cleanTime}`;        // YYYY-MM-DD HH:mm:ss
    }
   
    return dateString;
  };

  return (
    <div className="px-6 pt-2 pb-6 bg-gray-50 min-h-screen space-y-4">
   
      {/* Control Panel */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search cashier by name..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#07a876] focus:bg-white transition-all"
          />
        </div>
 
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-medium text-gray-500">From</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => { setFromDate(e.target.value); setCurrentPage(1); }}
              className="bg-transparent text-sm outline-none font-medium text-gray-700 cursor-pointer"
            />
          </div>
 
          <ArrowRight className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
 
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-medium text-gray-500">To</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => { setToDate(e.target.value); setCurrentPage(1); }}
              className="bg-transparent text-sm outline-none font-medium text-gray-700 cursor-pointer"
            />
          </div>
 
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#00aa5b] hover:bg-[#00944f] text-white font-bold text-sm rounded-xl shadow-sm transition-all h-[38px]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>
 
      {/* Main Table Wrapper */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <table className="w-full text-left border-collapse min-w-[1000px] table-auto">
            <thead>
              <tr className="bg-emerald-700 border-b border-emerald-800 text-white text-xs font-semibold uppercase">
                <th className="p-4 w-16 text-center">No.</th>
                <th className="p-4">Staff Member</th>
                <th className="p-4">Opening Time</th>
                <th className="p-4">Closing Time</th>
                <th className="p-4 text-right">Expected Cash</th>
                <th className="p-4 text-right">Actual Cash</th>
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
 
                  return (
                    <tr key={`${session.session_id}-${idx}`} className="hover:bg-slate-50 transition">
                      <td className="p-4 font-bold text-center text-slate-400">
                        {(currentPage - 1) * pageSize + idx + 1}.
                      </td>
                     
                      {/* Staff Member (Display username retrieved from User Relation) */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-700">
                            <User className="w-4 h-4" />
                          </div>
                          <span className="font-semibold text-slate-800 whitespace-nowrap">
                            {session.user?.username || "Unknown Staff"}
                          </span>
                        </div>
                      </td>
 
               {/* Opening Time */}
              <td className="py-4 px-5 text-gray-500 font-mono text-xs whitespace-nowrap">
                {formatRawDatabaseTime(session.opening_time)}
              </td>
 
              {/* Closing Time */}
              <td className="py-4 px-5 font-mono text-xs whitespace-nowrap">
                {isRunning ? (
                  <span className="inline-flex ...">Running</span>
                ) : (
                  <span className="text-gray-500">{formatRawDatabaseTime(session.closing_time)}</span>
                )}
              </td>
 
                      {/* Expected Cash */}
                      <td className="py-4 px-5 text-right text-gray-900 font-mono whitespace-nowrap">
                        {Number(session.expected_closing_cash || 0).toLocaleString()} Ks
                      </td>
 
                      {/* Actual Cash */}
                      <td className="py-4 px-5 text-right text-gray-900 font-mono whitespace-nowrap">
                        {!isRunning && session.actual_closing_cash !== null ? (
                          `${Number(session.actual_closing_cash).toLocaleString()} Ks`
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
 
                      {/* Discrepancy */}
                      <td className="py-4 px-5 text-center font-bold font-mono whitespace-nowrap">
                        {isRunning || session.discrepancy === null ? (
                          <span className="text-gray-300">-</span>
                        ) : Number(session.discrepancy) === 0 ? (
                          <span className="text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg text-xs">0</span>
                        ) : (
                          <span className="text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg text-xs">
                            {Number(discrepancy).toLocaleString()} Ks
                          </span>
                        )}
                      </td>
 
                      {/* Report / Notes */}
                      <td className="py-4 px-5 max-w-xs text-xs text-gray-500 pr-6">
                        <div className="flex items-center gap-1.5">
                          {session.report_text && (
                            <FileText className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                          )}
                          <span className="truncate block max-w-[180px]" title={session.report_text}>
                            {session.report_text || "-"}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
       
        {/* Pagination Design */}        
        <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400 font-bold select-none">
          <span className="text-gray-500">
            Total <span className="text-[#08694b] font-black text-sm">{totalRecords.toLocaleString()}</span> Records Found
          </span>
         
          <div className="flex items-center gap-1 max-w-full">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-md hover:bg-gray-200 text-gray-500 disabled:opacity-30 transition-colors flex-shrink-0"
            >
              <Trash2 className="w-4 h-4" /> {/* Fallback or structural boundary logic for clean actions */}
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-md hover:bg-gray-200 text-gray-500 disabled:opacity-30 transition-colors flex-shrink-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
 
            <div className="flex items-center gap-1 overflow-x-auto max-w-[150px] sm:max-w-[240px] py-1 px-0.5 scrollbar-none">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-7 h-7 rounded-md font-bold text-xs flex items-center justify-center border transition-all flex-shrink-0 ${
                    currentPage === page
                      ? "bg-[#08694b] border-[#08694b] text-white shadow-sm"
                      : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
 
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-md hover:bg-gray-200 text-gray-500 disabled:opacity-30 transition-colors flex-shrink-0"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-md hover:bg-gray-200 text-gray-500 disabled:opacity-30 transition-colors flex-shrink-0"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
 
    </div>
  );
};

export default ViewSession;