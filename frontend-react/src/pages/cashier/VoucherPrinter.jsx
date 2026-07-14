import React, { forwardRef, useState, useEffect } from 'react';
import api from '../../api/axios'; // 

const VoucherPrinter = forwardRef(({
  voucherId,
  cartItems,
  subtotal,
  totalDiscount,
  finalTotal,
  paymentMethod = 'Cash',
  payAmount,
  changeDue
}, ref) => {
  
  const [cashierName, setCashierName] = useState('System Admin');

  const currentDate = new Date().toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).replace(',', '');

  // Fetch authenticated user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await api.get("/user");
        if (response.data && response.data.username) {
          setCashierName(response.data.username);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
        setCashierName("Cashier");
      }
    };
    fetchCurrentUser();
  }, []);

  const isCashSelected = paymentMethod.toLowerCase() === 'cash';

  return (
    <div className="hidden">
      <div ref={ref} className="p-5 bg-white font-mono text-slate-800 text-[11px] leading-relaxed max-w-[340px] mx-auto tracking-tight">
        
        {/* Store Information */}
        <div className="text-center space-y-1 mb-5">
          <h2 className="text-sm font-extrabold tracking-wider text-slate-950 uppercase">MART4U SUPERMARKET</h2>
          <p className="text-[10px] text-slate-500 font-sans leading-normal">No. 123, Zawgyi Road, Pyigyitagon Township, Mandalay</p>
          <p className="text-[10px] text-slate-500 font-sans">Tel: 02-234567, 09-987654321</p>
        </div>

        {/* Voucher Metadata */}
        <div className="border-t border-b border-dashed border-slate-300 py-2.5 my-4 space-y-1.5 text-[10px] text-slate-600">
          <div className="flex justify-between items-center">
            <span className="uppercase font-medium">Voucher No</span>
            <span className="font-bold text-slate-950">#{voucherId || 'N/A'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="uppercase font-medium">Date & Time</span>
            <span className="font-medium text-slate-950 font-sans">{currentDate}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="uppercase font-medium">Cashier</span>
            <span className="font-medium text-slate-950">{cashierName}</span>
          </div>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-12 gap-1 font-extrabold text-[10px] text-slate-500 uppercase mb-2.5 pb-1.5 border-b border-slate-200 tracking-wider">
          <span className="col-span-5">Item</span>
          <span className="col-span-3 text-right">Unit Price</span>
          <span className="col-span-2 text-center">Qty</span>
          <span className="col-span-2 text-right">Amount</span>
        </div>

        {/* Cart Items List */}
        <div className="space-y-3.5 my-2 border-b border-dashed border-slate-200 pb-3.5">
          {cartItems.map((item) => {
            const currentItemPrice = item.price - (item.price * (item.discountPercent || 0) / 100);
            const totalRowPrice = currentItemPrice * item.quantity;

            return (
              <div key={item.id} className="space-y-1">
                <div className="grid grid-cols-12 gap-1 font-bold text-slate-900 items-start">
                  <span className="col-span-5 break-words pr-1 text-[11px] font-sans font-semibold leading-tight text-slate-950">{item.name}</span>
                  <span className="col-span-3 text-right font-medium text-slate-600 font-sans">{item.price.toLocaleString()}</span>
                  <span className="col-span-2 text-center font-medium text-slate-700 font-sans">{item.quantity}</span>
                  <span className="col-span-2 text-right font-bold text-slate-900 font-sans">{totalRowPrice.toLocaleString()}Ks</span>
                </div>
                {item.discountPercent > 0 && (
                  <div className="text-[9px] text-red-500 font-bold font-sans tracking-wide pl-0.5">
                    -{item.discountPercent}% off 
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Financial Breakdown */}
        <div className="space-y-2 border-b border-slate-300 pb-3.5 text-[11px]">
          <div className="flex justify-between text-slate-600 font-medium">
            <span>Subtotal:</span>
            <span className="font-sans font-semibold">{subtotal.toLocaleString()}Ks</span>
          </div>
          {totalDiscount > 0 && (
            <div className="flex justify-between text-red-500 font-bold tracking-wide">
              <span>Total Discount:</span>
              <span className="font-sans">-{totalDiscount.toLocaleString()}Ks</span>
            </div>
          )}
        </div>

        {/* Grand Total */}
        <div className="flex justify-between items-center py-3.5 border-b border-slate-300 text-slate-950">
          <span className="text-[11px] font-black tracking-wider uppercase">TOTAL(Inclusive Tax):</span>
          <span className="text-base font-sans font-black tracking-tight text-slate-950">{finalTotal.toLocaleString()}Ks</span>
        </div>

        {/* Payment Summary */}
        <div className="pt-3.5 space-y-1.5 text-[10px] text-slate-700">
          <div className="flex justify-between items-center">
            <span className="font-medium uppercase tracking-tight">Paid By ({paymentMethod}):</span>
            <span className="font-sans font-bold text-slate-950 text-[11px]">
              {isCashSelected 
                ? `${(parseFloat(payAmount) || 0).toLocaleString()}Ks` 
                : `${finalTotal.toLocaleString()}Ks`
              }
            </span>
          </div>
          {isCashSelected && (
            <div className="flex justify-between items-center text-slate-600">
              <span className="uppercase tracking-tight">Change :</span>
              <span className="font-sans font-bold text-emerald-600 text-[11px]">{changeDue.toLocaleString()}Ks</span>
            </div>
          )}
        </div>

        {/* Footer / Greetings */}
        <div className="text-center mt-7 pt-4 border-t border-dashed border-slate-200 text-[10px] text-slate-400 font-sans tracking-wide space-y-1">
          <p className="font-medium">Thank you for shopping with us!</p>
          <p className="text-[9px] text-slate-400/80">Goods sold are not returnable.</p>
        </div>

      </div>
    </div>
  );
});

VoucherPrinter.displayName = 'VoucherPrinter';
export default VoucherPrinter;