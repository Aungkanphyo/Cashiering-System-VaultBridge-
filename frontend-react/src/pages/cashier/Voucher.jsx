import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import VoucherPrinter from './VoucherPrinter';
import toast from 'react-hot-toast';

const Voucher = ({
	voucherId,
	cartItems,
	recentProductId,
	subtotal,
	totalDiscount,
	finalTotal,
	paymentMethod,
	payAmount,
	changeDue,
	setPaymentMethod,
	setPayAmount,
	handleUpdateQty,
	handleDirectQtyChange,
	handleDeleteItem,
	handleClearCart,
	handleProcessSale
}) => {
  
  const printComponentRef = useRef();

  // Print trigger integration that resets cart on safe execution without window reloads
  const handlePrintFn = useReactToPrint({
    contentRef: printComponentRef,
    onAfterPrint: () => {
      handleClearCart();
      toast.success('Sale processed successfully!');
    }
  });

  // Action flow control with interactive UI form validation
  const handlePayAndPrint = async () => {
    if (cartItems.length === 0) {
      toast.error('No products in the cart to process sale.');
      return;
    }

    if (paymentMethod === 'Cash') {
      const parsedPayAmount = parseFloat(payAmount);
      
      if (!payAmount || isNaN(parsedPayAmount) || parsedPayAmount <= 0) {
        toast.error('Please enter a received payment amount!');
        return; 
      }

      if (parsedPayAmount < finalTotal) {
        toast.error(`Insufficient amount! Received amount is less than ${finalTotal.toLocaleString()} Ks.`);
        return; 
      }
    }

    try {
      // 1. Persist data record update to API Database pipeline
      await handleProcessSale();
      
      // 2. Safely trigger print preview overlay context on success
      handlePrintFn();

    } catch (error) {
      console.error("Sale processing failed:", error);
      toast.error("Failed to save transaction to database.");
    }
  };

  return (
    <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between h-[calc(90vh-16px)] sticky top-0">
      
      {/* Hidden Voucher Element Target Node Container */}
      <VoucherPrinter 
        ref={printComponentRef}
        voucherId={voucherId}
        cartItems={cartItems}
        subtotal={subtotal}
        totalDiscount={totalDiscount}
        finalTotal={finalTotal}
        paymentMethod={paymentMethod}
        payAmount={payAmount}
        changeDue={changeDue}
      />

			<div className="flex flex-col flex-1 min-h-0">
				<div className="flex justify-between items-center pb-2 border-b border-slate-100 mb-3">
					<h3 className="text-xs font-black text-slate-900 tracking-wide uppercase flex items-center gap-1.5">
						<span className="h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
						VOUCHER NO: #{voucherId}
					</h3>
					<button onClick={handleClearCart} className="text-[10px] font-bold text-red-500 hover:underline">
						Clear All
					</button>
				</div>

				<div className="space-y-1.5 flex-1 overflow-y-auto pr-0.5 min-h-0">
					{cartItems.map((item) => {
						const itemDiscountPrice = item.price - (item.price * item.discountPercent / 100);
						const itemFinalRowTotal = itemDiscountPrice * item.quantity;

						return (
							<div
								key={item.id}
								className={`flex items-center justify-between p-2 rounded-lg border transition-all duration-300 ${(recentProductId && item.id && recentProductId === item.id)
									? 'bg-emerald-50/70 border-emerald-400 ring-2 ring-emerald-100'
									: 'bg-slate-50 border-slate-100'
									}`}
							>
								<div className="w-[45%]">
									<p className={`text-xs font-bold line-clamp-1 ${(recentProductId && item.id && recentProductId === item.id) ? 'text-emerald-800 font-extrabold' : 'text-slate-800'
										}`}>
										{item.name}
									</p>
									<div className="flex items-center gap-2 mt-0.5">
										<p className="text-[10px] text-slate-400 font-sans font-medium">
											{item.price.toLocaleString()} ks
										</p>
										{item.discountPercent > 0 && (
											<span className="text-red-500 font-sans text-[10px] font-black bg-red-50 px-1 rounded">
												-{item.discountPercent}%
											</span>
										)}
									</div>
								</div>

								<div className="flex items-center border border-slate-200 bg-white rounded-md overflow-hidden">
									<button onClick={() => handleUpdateQty(item.id, -1)} className="px-1.5 py-0.5 text-[10px] bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold">-</button>
									<input
										type="number"
										min="1"
										value={item.quantity === 0 ? '' : item.quantity}
										onChange={(e) => handleDirectQtyChange(item.id, e.target.value)}
										onBlur={() => { if (item.quantity === 0) handleDirectQtyChange(item.id, 1); }}
										className="w-8 text-[11px] font-sans font-bold text-slate-800 text-center focus:outline-none bg-transparent"
									/>
									<button onClick={() => handleUpdateQty(item.id, 1)} className="px-1.5 py-0.5 text-[10px] bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold">+</button>
								</div>

								<div className="text-right font-sans text-xs font-bold text-slate-900 min-w-[65px]">
									{itemFinalRowTotal.toLocaleString()} <span className="text-[9px] font-sans font-normal text-slate-400">Ks</span>
								</div>

								<button onClick={() => handleDeleteItem(item.id)} className="p-1 text-slate-400 hover:text-red-500 text-base font-medium leading-none">&times;</button>
							</div>
						);
					})}
				</div>
			</div>

			<div className="border-t border-slate-100 pt-3 mt-3 space-y-1.5 text-xs font-medium bg-white">
				<div className="flex justify-between text-slate-500">
					<span>Subtotal:</span>
					<span className="font-sans text-slate-800">{subtotal.toLocaleString()} Ks</span>
				</div>
				<div className="flex justify-between text-red-500 font-bold">
					<span>Discount:</span>
					<span className="font-sans">-{totalDiscount.toLocaleString()} Ks</span>
				</div>
				<div className="flex justify-between items-center pt-2 border-t border-dashed border-slate-200 text-sm font-black text-slate-900">
					<span>Total (Inclusive Tax):</span>
					<span className="font-sans text-base text-emerald-600">{finalTotal.toLocaleString()} Ks</span>
				</div>
			</div>

      {/* METHOD SELECTOR */}
      <div className="mt-3 pt-2 border-t border-slate-100 grid grid-cols-12 gap-2.5 items-center bg-white">
        <div className="col-span-4">
          <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Method</label>
          <div className="flex gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => { setPaymentMethod('Cash'); setPayAmount(''); }}
              className={`flex-1 py-1 text-[9px] font-bold rounded-md transition-all ${paymentMethod === 'Cash' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
            >
              💵 Cash
            </button>
            <button
              onClick={() => { setPaymentMethod('KPay'); setPayAmount(''); }}
              className={`flex-1 py-1 text-[9px] font-bold rounded-md transition-all ${paymentMethod === 'KPay' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
            >
              📱 KPay
            </button>
          </div>
        </div>

				<div className="col-span-8 grid grid-cols-2 gap-2">
					<div>
						<label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Pay Amount</label>
						<input
							type="number"
							placeholder={paymentMethod === 'Cash' ? "Enter Cash" : "0"}
							className={`w-full px-2 py-0.5 h-7 text-xs font-sans font-bold border rounded-md focus:outline-none bg-white text-slate-800 border-slate-200 focus:border-emerald-500 ${paymentMethod === 'KPay' ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' : ''
								}`}
							value={paymentMethod === 'KPay' ? finalTotal : payAmount}
							onChange={(e) => setPayAmount(e.target.value)}
							disabled={paymentMethod === 'KPay'}
						/>
					</div>
					<div>
						<label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Change Due</label>
						<div className="w-full px-2 py-0.5 h-7 flex items-center text-xs font-sans font-black text-emerald-600 bg-emerald-50 rounded-md border border-emerald-100">
							{changeDue.toLocaleString()}
						</div>
					</div>
				</div>
			</div>

      <div className="pt-3 bg-white">
        <button
          disabled={cartItems.length === 0} 
          onClick={handlePayAndPrint} 
          className={`w-full py-2 px-4 rounded-lg font-bold text-xs border shadow-xs transition-all flex items-center justify-center gap-1.5 ${
            cartItems.length === 0 
              ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60' 
              : 'bg-emerald-600 hover:bg-emerald-700 border-emerald-700 text-white active:scale-[0.99]'
            }`}
        >
          <span>🧾</span> Pay & Print
        </button>
      </div>

		</div>
	);
};

export default Voucher;