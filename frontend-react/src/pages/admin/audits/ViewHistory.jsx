import { useEffect, useState } from "react";
import ViewDetails from "./ViewDetails";
import api from "../../../api/axios";
import {
	Search,
	RotateCcw,
	Calendar,
	ArrowRight,
	Eye,
	ChevronsLeft,
	ChevronLeft,
	ChevronRight,
	ChevronsRight,
    FileSpreadsheet
} from "lucide-react";

const ViewHistory = () => {
	// Server-side State Management
	const [transactions, setTransactions] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	// Input controller states
	const [searchTerm, setSearchTerm] = useState("");
	const [fromDate, setFromDate] = useState("");
	const [toDate, setToDate] = useState("");

	// Server-side Pagination States
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [totalRecords, setTotalRecords] = useState(0);
	const [fromRecord, setFromRecord] = useState(0);
	const [toRecord, setToRecord] = useState(0);

	// Modal & Voucher State
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedVoucher, setSelectedVoucher] = useState(null);

	useEffect(() => {
		const fetchVouchers = async () => {
			try {
				setIsLoading(true);
				setError(null);

				const response = await api.get("/admin/vouchers", {
					params: {
						page: currentPage,
						search: searchTerm,
						from_date: fromDate,
						to_date: toDate,
						per_page: 8
					}
				});

				const { data, last_page, total, from, to } = response.data;

				setTransactions(data);
				setTotalPages(last_page);
				setTotalRecords(total);
				setFromRecord(from || 0);
				setToRecord(to || 0);
			} catch (error) {
				setError(error.response?.data?.message || "Failed to fetch data from server.");
			} finally {
				setIsLoading(false);
			}
		};

		const delayDebounceFn = setTimeout(() => {
			fetchVouchers();
		}, 1000);

		return () => clearTimeout(delayDebounceFn);
	}, [currentPage, searchTerm, fromDate, toDate])

	const handleReset = () => {
		setSearchTerm("");
		setFromDate("");
		setToDate("");
		setCurrentPage(1);
	};

	const handleViewVoucher = (voucher) => {
		setSelectedVoucher(voucher);
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
					<div className="overflow-x-auto scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
						<table className="w-full text-left border-collapse min-w-275 table-auto">
							<thead>
								<tr className="bg-[#08694b] text-white text-xs uppercase font-bold tracking-wider select-none">
									<th className="py-4 px-5 w-16">No.</th>
									<th className="py-4 px-5">Sale ID</th>
									<th className="py-4 px-5">Date & Time</th>
									<th className="py-4 px-5 text-right">Total Grand</th>
									<th className="py-4 px-5 text-right">Change</th>
									<th className="py-4 px-5 text-center">Payment Method</th>
									<th className="py-4 px-5 text-center">Status</th>
									<th className="py-4 px-5 text-center w-32">Action</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-100 text-sm font-medium text-gray-700">
								{isLoading ? (
									<tr>
										<td colSpan="8" className="text-center py-12 text-emerald-600 font-bold animate-pulse">
											Loading data from database...
										</td>
									</tr>
								) : error ? (
									<tr>
										<td colSpan="8" className="text-center py-12 text-red-500 font-semibold">
											{error}
										</td>
									</tr>
								) : transactions.length > 0 ? (
									transactions.map((tx, idx) => (
										<tr
											key={`${tx.id}-${idx}`}
											className={`hover:bg-emerald-50 hover:ring-2 hover:ring-emerald-100 transition-all duration-200 group relative ${tx.status === "VOIDED" ? "bg-red-50/40" : ""
												}`}
										>
											<td className="py-4 px-5 font-semibold text-gray-400">
												{fromRecord + idx}.
											</td>

											<td className="py-4 px-5 font-bold text-gray-900">
												#{tx.id}
											</td>

											<td className="py-4 px-5 text-gray-500 font-mono text-xs whitespace-nowrap">
												{tx.dateTime}
											</td>

											<td className="py-4 px-5 text-right font-mono font-black text-slate-900 whitespace-nowrap" >
												<span className={tx.status === "VOIDED" ? "line-through text-gray-400" : ""}>
													{tx.finalAmount.toLocaleString()} Ks
												</span>
											</td>

											<td className="py-4 px-5 text-right font-mono font-bold text-amber-600 bg-amber-50/20 whitespace-nowrap">
												{tx.status === "VOIDED" ? (
													<span className="text-gray-400 line-through">{(tx.changeAmount || 0).toLocaleString()} Ks</span>
												) : (
													<span>{(tx.changeAmount || 0).toLocaleString()} Ks</span>
												)}
											</td>

											<td className="py-4 px-5 text-center whitespace-nowrap">
												{tx.paymentMethod.toLowerCase().includes("cash") ? (
													<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-200 text-xs font-bold">
														💵 Cash: {(tx.paidAmount || tx.finalAmount).toLocaleString()} Ks
													</span>
												) : (
													<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#1e293b]/10 text-[#1a43bf] border border-[#1e293b]/20 text-xs font-bold">
														📱 {tx.paymentMethod}: {tx.finalAmount.toLocaleString()} Ks
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
															<span className="text-[10px] text-red-400 font-medium italic mt-0.5 max-w-37.5 line-clamp-2" title={tx.voidReason}>
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
							Showing {fromRecord} - {toRecord} of {totalRecords} records
						</span>

						<div className="flex items-center gap-1 max-w-full">
							<button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="p-1.5 rounded-md hover:bg-gray-200 text-gray-500 disabled:opacity-30 transition-colors shrink-0">
								<ChevronsLeft className="w-4 h-4" />
							</button>
							<button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="p-1.5 rounded-md hover:bg-gray-200 text-gray-500 disabled:opacity-30 transition-colors shrink-0">
								<ChevronLeft className="w-4 h-4" />
							</button>

							<div className="flex items-center gap-1 overflow-x-auto max-w-37.5 sm:max-w-60 py-1 px-0.5 scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
								{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
									<button
										key={page}
										onClick={() => setCurrentPage(page)}
										className={`w-7 h-7 rounded-md font-bold text-xs flex items-center justify-center border transition-all shrink-0 ${currentPage === page ? "bg-[#08694b] border-[#08694b] text-white shadow-sm" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
											}`}
									>
										{page}
									</button>
								))}
							</div>

							<button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="p-1.5 rounded-md hover:bg-gray-200 text-gray-500 disabled:opacity-30 transition-colors shrink-0">
								<ChevronRight className="w-4 h-4" />
							</button>
							<button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="p-1.5 rounded-md hover:bg-gray-200 text-gray-500 disabled:opacity-30 transition-colors shrink-0">
								<ChevronsRight className="w-4 h-4" />
							</button>
						</div>
					</div>
				</div>

			</div>

			{/* Selected Transaction in Detail*/}
			<ViewDetails
				isOpen={isModalOpen}
				onClose={() => { setIsModalOpen(false); setSelectedVoucher(null); }}
				transaction={selectedVoucher}
			/>
		</div>
	);
};

export default ViewHistory;