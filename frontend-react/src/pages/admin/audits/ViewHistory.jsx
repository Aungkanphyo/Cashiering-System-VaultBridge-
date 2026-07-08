import React, { useState } from "react";
import ViewDetails from "./ViewDetails"; 
import { 
  Search, 
  RotateCcw, 
  Calendar, 
  ArrowRight, 
  Eye,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight
} from "lucide-react";

const ViewHistory = () => {
  
  // အမ်းငွေ တွက်ချက်မှုအတွက် paidAmount နဲ့ changeAmount data fields များ ထည့်သွင်းထားပါတယ်
  const [transactions, setTransactions] = useState([
    {
      id: "6001", dateTime: "06-06-2006 09:15:30", subtotal: 24000, totalDiscount: 0, finalAmount: 24000, paidAmount: 30000, changeAmount: 6000, paymentMethod: "Cash", status: "COMPLETED", voidReason: "",
      items: [
        { name: "Premier Coffee Mix 30s", qty: 2, unitPrice: 12000, subtotal: 24000 }
      ]
    },
    {
      id: "6002",  dateTime: "07-07-2026 11:30:10", subtotal: 41000, totalDiscount: 1400, finalAmount: 39600, paidAmount: 41580, changeAmount: 0, paymentMethod: "KPay", status: "COMPLETED", voidReason: "",
      items: [
        { name: "Laser Brand Toothbrush", qty: 1, unitPrice: 5000, subtotal: 5000 },
        { name: "Sensodyne Toothpaste 100g", qty: 3, unitPrice: 12000, subtotal: 36000 }
      ]
    },
    {
      id: "6003", dateTime: "2026-06-07 13:45:22", subtotal: 12000, totalDiscount: 0, finalAmount: 12000, paidAmount: 15000, changeAmount: 3000, paymentMethod: "Cash", status: "VOIDED", voidReason: "Customer-selected wrong item",
      items: [
        { name: "Premier Coffee Mix 30s", qty: 1, unitPrice: 12000, subtotal: 12000 }
      ]
    },
    {
      id: "6004", dateTime: "06-08-2026 14:20:00", subtotal: 35000, totalDiscount: 500, finalAmount: 34500, paidAmount: 36250, changeAmount: 0, paymentMethod: "KPay", status: "COMPLETED", voidReason: "",
      items: [
        { name: "Nescafe Gold 200g", qty: 1, unitPrice: 35000, subtotal: 35000 }
      ]
    },
    {
      id: "6005", dateTime: "2026-06-07 13:45:22", subtotal: 12000, totalDiscount: 0, finalAmount: 12000, paidAmount: 20000, changeAmount: 8000, paymentMethod: "Cash", status: "VOIDED", voidReason: "Customer-selected wrong itemCustomer-selected wrong itemCustomer-selected wrong itemCustomer-selected wrong itemCustomer-selected wrong itemCustomer-selected wrong itemCustomer-selected wrong itemCustomer-selected wrong itemCustomer-selected wrong item",
      items: [
        { name: "Premier Coffee Mix 30s", qty: 1, unitPrice: 12000, subtotal: 12000 }
      ]
    },
  ]);

  // Input controller states
  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 8; 

  // Modal & Voucher State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);

  // Date parser helper
  const parseDateTime = (dateTimeStr) => {
    if (!dateTimeStr || dateTimeStr === "-") return new Date(0);
    const datePart = dateTimeStr.split(" ")[0];
    if (datePart.includes("-") && datePart.split("-")[0].length === 2) {
      const [day, month, year] = datePart.split("-");
      const timePart = dateTimeStr.split(" ")[1] || "00:00:00";
      return new Date(`${year}-${month}-${day}T${timePart}`);
    }
    return new Date(dateTimeStr.replace(" ", "T"));
  };

  const handleReset = () => {
    setSearchTerm("");
    setFromDate("");
    setToDate("");
    setCurrentPage(1);
  };

  // Advanced Filter Handler
  const filteredTransactions = transactions.filter((tx) => {
    const query = searchTerm.toLowerCase().trim();
    
    const matchesID = tx.id.toLowerCase().includes(query);
    const matchesPayMethod = tx.paymentMethod.toLowerCase().includes(query);
    const matchesStatus = tx.status.toLowerCase().includes(query);
    
    const matchesSearch = matchesID || matchesPayMethod || matchesStatus;

    const parsedDateObj = parseDateTime(tx.dateTime);
    const txDateStr = `${parsedDateObj.getFullYear()}-${String(parsedDateObj.getMonth() + 1).padStart(2, "0")}-${String(parsedDateObj.getDate()).padStart(2, "0")}`;
    
    let matchesDate = true;
    if (fromDate && toDate) {
      matchesDate = txDateStr >= fromDate && txDateStr <= toDate;
    } else if (fromDate) {
      matchesDate = txDateStr >= fromDate;
    } else if (toDate) {
      matchesDate = txDateStr <= toDate;
    }

    return matchesSearch && matchesDate;
  });

  // Dynamic Sort Handler
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    return parseDateTime(b.dateTime) - parseDateTime(a.dateTime);
  });

  // Pagination Logic
  const totalPages = Math.ceil(sortedTransactions.length / rowsPerPage) || 1;
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = sortedTransactions.slice(indexOfFirstRow, indexOfLastRow);

  const handleViewVoucher = (tx) => {
    setSelectedTx(tx);
    setIsModalOpen(true);
  };

  return (
    <div className="relative min-h-screen bg-gray-50">
      <div className={`px-6 pt-2 pb-6 space-y-4 transition-all duration-300 ${isModalOpen ? "blur-sm pointer-events-none select-none" : ""}`}>
        
        {/* Control Panel */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ID, Method (Cash/KPay) or Status..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#08694b] focus:bg-white transition-all"
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
              className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-medium text-sm rounded-xl shadow-sm transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>
        </div>

        {/* Main Table Wrapper */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <table className="w-full text-left border-collapse min-w-[1100px] table-auto">
              <thead>
                <tr className="bg-[#08694b] text-white text-xs uppercase font-bold tracking-wider select-none">
                  <th className="py-4 px-5 w-16">No.</th>
                  <th className="py-4 px-5">Sale ID</th>
                  <th className="py-4 px-5">Date & Time</th>
                  <th className="py-4 px-5 text-right">Subtotal</th>                  
                  <th className="py-4 px-5 text-right">Total Discount</th>
                  <th className="py-4 px-5 text-right">Total Grand</th>
                  <th className="py-4 px-5 text-right">Change</th>
                  <th className="py-4 px-5 text-center">Payment Method</th>
                  <th className="py-4 px-5 text-center">Status</th>
                  <th className="py-4 px-5 text-center w-32">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm font-medium text-gray-700">
                {currentRows.length > 0 ? (
                  currentRows.map((tx, idx) => (
                    <tr 
                      key={`${tx.id}-${idx}`} 
                      className={`hover:bg-emerald-50 hover:ring-2 hover:ring-emerald-100 transition-all duration-200 group relative ${
                        tx.status === "VOIDED" ? "bg-red-50/40" : ""
                      }`}
                    >
                      <td className="py-4 px-5 font-semibold text-gray-400">
                        {indexOfFirstRow + idx + 1}.
                      </td>
                      
                      <td className="py-4 px-5 font-bold text-gray-900">
                        #{tx.id}
                      </td>

                      <td className="py-4 px-5 text-gray-500 font-mono text-xs whitespace-nowrap">
                        {tx.dateTime}
                      </td>

                      <td className={`py-4 px-5 text-right font-mono whitespace-nowrap ${tx.status === "VOIDED" ? "text-gray-400 line-through" : "text-gray-900"}`}>
                        {tx.subtotal.toLocaleString()} Ks
                      </td>

                      <td className={`py-4 px-5 text-right font-mono text-red-500 whitespace-nowrap ${tx.status === "VOIDED" ? "opacity-40" : ""}`}>
                        {tx.totalDiscount > 0 ? `-${tx.totalDiscount.toLocaleString()} Ks` : "0"}
                      </td>

                      <td className="py-4 px-5 text-right font-mono font-black text-slate-900 whitespace-nowrap" >
                        <span className={tx.status === "VOIDED" ? "line-through text-gray-400" : ""}>
                          {tx.finalAmount.toLocaleString()} Ks
                        </span>
                      </td>

                      {/* 🌟 New Change Column */}
                      <td className="py-4 px-5 text-right font-mono font-bold text-amber-600 bg-amber-50/20 whitespace-nowrap">
                        {tx.status === "VOIDED" ? (
                          <span className="text-gray-400 line-through">{(tx.changeAmount || 0).toLocaleString()} Ks</span>
                        ) : (
                          <span>{(tx.changeAmount || 0).toLocaleString()} Ks</span>
                        )}
                      </td>

                      <td className="py-4 px-5 text-center whitespace-nowrap">
                        {tx.paymentMethod === "Cash" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-200 text-xs font-bold">
                            💵 Cash: {(tx.paidAmount || tx.finalAmount).toLocaleString()}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#1e293b]/10 text-[#1a43bf] border border-[#1e293b]/20 text-xs font-bold">
                            📱 KPay: {tx.finalAmount.toLocaleString()}
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-5 text-center whitespace-nowrap">
                        {tx.status === "COMPLETED" ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-sans font-bold text-[10px] uppercase tracking-wide">
                            COMPLETED
                          </span>
                        ) : (
                          <div className="flex flex-col items-center justify-center">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 font-sans font-bold text-[10px] uppercase tracking-wide">
                              VOIDED
                            </span>
                            {tx.voidReason && (
                              <span className="text-[10px] text-red-400 font-medium italic mt-0.5 max-w-[150px] line-clamp-2" title={tx.voidReason}>
                                {tx.voidReason}
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-5 text-center">
                        <button
                          type="button"
                          onClick={() => handleViewVoucher(tx)} 
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="text-center py-12 text-gray-400 font-medium">
                      No sales history or vouchers match the specified filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}        
          <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400 font-semibold select-none">
            <span>
              Showing {sortedTransactions.length > 0 ? indexOfFirstRow + 1 : 0} - {Math.min(indexOfLastRow, sortedTransactions.length)} of {sortedTransactions.length} records
            </span>
            
            <div className="flex items-center gap-1 max-w-full">
              <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="p-1.5 rounded-md hover:bg-gray-200 text-gray-500 disabled:opacity-30 transition-colors flex-shrink-0">
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="p-1.5 rounded-md hover:bg-gray-200 text-gray-500 disabled:opacity-30 transition-colors flex-shrink-0">
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1 overflow-x-auto max-w-[150px] sm:max-w-[240px] py-1 px-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-7 h-7 rounded-md font-bold text-xs flex items-center justify-center border transition-all flex-shrink-0 ${
                      currentPage === page ? "bg-[#08694b] border-[#08694b] text-white shadow-sm" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="p-1.5 rounded-md hover:bg-gray-200 text-gray-500 disabled:opacity-30 transition-colors flex-shrink-0">
                <ChevronRight className="w-4 h-4" />
              </button>
              <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="p-1.5 rounded-md hover:bg-gray-200 text-gray-500 disabled:opacity-30 transition-colors flex-shrink-0">
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Selected Transaction in Detail*/}
      <ViewDetails 
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedTx(null); }}
        transaction={selectedTx}
      />
    </div>
  );
};

export default ViewHistory;