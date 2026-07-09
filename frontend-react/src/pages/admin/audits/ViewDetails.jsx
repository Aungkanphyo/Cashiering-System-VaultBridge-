import { X } from "lucide-react";

const ViewDetails = ({ isOpen, onClose, transaction }) => {
	if (!isOpen || !transaction) return null;

	const items = transaction.items || [];

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
			<div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden border border-gray-100 flex flex-col transform transition-all animate-scale-in">

				{/* Header */}
				<div className="p-5 border-b border-gray-100 flex items-center justify-between">
					<div>
						<h3 className="text-lg font-bold text-gray-900">Voucher Detail</h3>
						<p className="text-xs text-gray-400 font-medium mt-0.5 font-mono">
							Voucher No: #{transaction.id} | Date: {transaction.dateTime} | Status:{" "}
							<span className={transaction.status === "VOIDED" ? "text-red-500 font-bold" : "text-emerald-600 font-bold"}>
								{transaction.status}
							</span>
						</p>
					</div>
					<button
						onClick={onClose}
						className="p-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				{/* Content Body */}
				<div className="p-5 space-y-5 overflow-y-auto max-h-[calc(100vh-200px)] scrollbar-thin">

					{/* Purchase Line Items Table */}
					<div className="space-y-2">
						<h4 className="text-xs uppercase tracking-wider font-bold text-gray-400 select-none">
							Purchase Line Items (SALES_DETAILS)
						</h4>
						<div className="border border-gray-100 rounded-xl overflow-hidden">
							<table className="w-full text-left text-xs border-collapse">
								<thead>
									<tr className="bg-gray-50/75 text-gray-500 font-bold border-b border-gray-100 select-none">
										<th className="py-3 px-4">Product Name</th>
										<th className="py-3 px-2 text-center">Qty</th>
										<th className="py-3 px-2 text-right">Unit Price</th>
										<th className="py-3 px-2 text-center">Discount (%)</th>
										<th className="py-3 px-4 text-right">Subtotal</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-50 text-gray-700 font-medium">
									{items.length > 0 ? (
										items.map((item, index) => (
											<tr key={index} className="hover:bg-gray-50/50 transition-colors">
												<td className="py-3 px-4 font-semibold text-gray-900">{item.name}</td>
												<td className="py-3 px-2 text-center font-mono text-gray-500">{item.qty}</td>
												<td className="py-3 px-2 text-right font-mono">{(item.unitPrice || 0).toLocaleString()}</td>
												<td className="py-3 px-2 text-center font-mono text-red-500">
													{item.discount || 0}% (-{(((item.unitPrice || 0) * (item.discount || 0)) / 100).toLocaleString()})
												</td>
												<td className="py-3 px-4 text-right font-mono font-bold text-gray-900">{(item.subTotal || 0).toLocaleString()}</td>
											</tr>
										))
									) : (
										<tr>
											<td colSpan="6" className="text-center py-6 text-gray-400">No items found in this voucher.</td>
										</tr>
									)}
								</tbody>
							</table>
						</div>
					</div>

					{/* Pricing Breakdown Layout Grid */}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

						{/* Voucher Summary Card */}
						<div className="bg-gray-50/50 border border-gray-100 rounded-xl p-4 space-y-2.5">
							<h5 className="text-[10px] uppercase tracking-wider font-bold text-gray-400 select-none">
								Voucher Summary
							</h5>
							<div className="space-y-1.5 text-xs font-semibold text-gray-600">
								<div className="flex justify-between">
									<span>Subtotal:</span>
									<span className="font-mono text-gray-900">{(transaction.subtotal || 0).toLocaleString()} Ks</span>
								</div>
								<div className="flex justify-between text-red-500">
									<span>(-) Total Discount:</span>
									<span className="font-mono">-{(transaction.totalDiscount || 0).toLocaleString()} Ks</span>
								</div>

								<div className="border-t border-dashed border-gray-200 pt-2 flex justify-between items-baseline">
									<span className="text-sm font-bold text-gray-900">Grand Total:</span>
									<span className="text-base font-black text-[#08694b] font-mono">
										{(transaction.finalAmount || 0).toLocaleString()} Ks
									</span>
								</div>
							</div>
						</div>

						{/* Payments Breakdown Card */}
						<div className="bg-gray-50/50 border border-gray-100 rounded-xl p-4 space-y-2.5">
							<h5 className="text-[10px] uppercase tracking-wider font-bold text-gray-400 select-none">
								Sales Payment
							</h5>
							<div className="space-y-2">
								{/* Received Amount */}
								<div className="p-2.5 bg-purple-50 border border-purple-100 rounded-lg flex justify-between items-center text-xs font-semibold text-purple-700">
									<span>{transaction.paymentMethod} Received:</span>
									<span className="font-mono text-sm font-bold">
										{(transaction.paidAmount || transaction.finalAmount).toLocaleString()} Ks
									</span>
								</div>

								{/*  Change Amount Box */}
								<div className="p-2.5 bg-amber-50 border border-amber-100 rounded-lg flex justify-between items-center text-xs font-semibold text-amber-700">
									<span>(-) Change:</span>
									<span className="font-mono text-sm font-black">
										{(transaction.changeAmount || 0).toLocaleString()} Ks
									</span>
								</div>
							</div>
						</div>

					</div>

					{/* Void Reason Card */}
					{transaction.status === "VOIDED" && transaction.voidReason && (
						<div className="mt-4 p-4 bg-red-50/60 border border-red-100 rounded-xl space-y-2 w-full">
							<div className="flex items-center gap-1.5 text-xs font-bold text-red-700 select-none">
								<span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
								Void Reason
							</div>
							<p
								className="text-[11px] text-red-600 font-medium font-sans leading-relaxed break-words bg-white/80 p-3 rounded-lg border border-red-50 max-h-[120px] overflow-y-auto [scrollbar-width:thin]"
								title={transaction.voidReason}
							>
								{transaction.voidReason}
							</p>
						</div>
					)}

				</div>

			</div>
		</div>
	);
};

export default ViewDetails;