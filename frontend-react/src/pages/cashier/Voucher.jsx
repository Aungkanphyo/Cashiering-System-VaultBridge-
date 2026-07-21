import { useState, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { BanknoteArrowDown } from "lucide-react";
import VoucherPrinter from './VoucherPrinter';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const Voucher = ({
    voucherId,
    cartItems,
    recentProductId,
    handleUpdateQty,
    handleDirectQtyChange,
    handleDeleteItem,
    handleClearCart,
    dbPaymentMethods,
    fetchNextVoucherId,
    setAvailableProducts
}) => {
    // --- Local States for Payments ---
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [payAmount, setPayAmount] = useState('');


    // Default payment method setup when dbPaymentMethods are loaded
    useEffect(() => {
        if (dbPaymentMethods && dbPaymentMethods.length > 0) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setPaymentMethod(dbPaymentMethods[0].payment_name);
        }
    }, [dbPaymentMethods]);

    // --- Calculation Logics ---
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalDiscount = cartItems.reduce((sum, item) => sum + ((item.price * item.discountPercent / 100) * item.quantity), 0);
    const finalTotal = subtotal - totalDiscount;

    const isCashSelected = paymentMethod.toLowerCase() === 'cash';
    const currentPayAmount = isCashSelected ? (parseFloat(payAmount) || 0) : finalTotal;
    const changeDue = currentPayAmount > finalTotal ? currentPayAmount - finalTotal : 0;

    // React to Print Integration target node ref
    const printComponentRef = useRef();

    // Print trigger execution (resets cart on success)
    const handlePrintFn = useReactToPrint({
        contentRef: printComponentRef,
        // chang documentTitle to function expression 
        documentTitle: () => `Mark4U_Voucher_${voucherId || '0000'}`,
        onAfterPrint: () => {
            onClearAll();
            toast.success('Sale processed successfully!');
        }
    });

    // Local handler to reset inputs
    const onClearAll = () => {
        setPayAmount('');
        handleClearCart();
    };

    // Action flow control with UI form validation
    const handlePayAndPrint = async () => {
        if (cartItems.length === 0) {
            toast.error('No products in the cart to process sale.');
            return;
        }

        // Qty limits verification before submit
        for (const item of cartItems) {
            const stockLimit = item.stock_quantity ?? 0;
            if (item.quantity > stockLimit) {
                toast.error(`"${item.name}" exceeds the available stock (${stockLimit})!`);
                return;
            }
        }

        if (isCashSelected) {
            const parsedPayAmount = parseFloat(payAmount);
            if (!payAmount || parsedPayAmount <= 0) {
                toast.error('Please enter a received payment amount!');
                return;
            }

            if(isNaN(parsedPayAmount)){
                toast.error("Please enter number only!");
                return;
            }

            if (parsedPayAmount < finalTotal) {
                toast.error(`Insufficient amount! Received amount is less than ${finalTotal.toLocaleString()} Ks.`);
                return;
            }
        }

        const matchedPaymentObj = dbPaymentMethods.find(
            method => method.payment_name.toLowerCase() === paymentMethod.toLowerCase()
        );

        if (!matchedPaymentObj) {
            toast.error(`The selected payment method [${paymentMethod}] was not found in the database.`);
            return;
        }

        const salePayload = {
            payment_id: matchedPaymentObj.payment_id,
            status: 'completed',
            payment_received: isCashSelected ? parseFloat(payAmount) : finalTotal,
            items: cartItems.map(item => ({
                product_id: Number(item.id),
                quantity: parseInt(item.quantity, 10),
            }))
        };

        try {
            // 1. API Post Request
            const response = await api.post('/vouchers', salePayload);

            if (response.status === 200 || response.status === 201 || response.data.success) {
                // 2. Fetch fresh stock quantities
                const prodResponse = await api.get('/products');
                const updatedProducts = prodResponse.data.map((p, idx) => ({
                    id: p.id ? Number(p.id) : (p.product_id ? Number(p.product_id) : (idx + 1)),
                    code: String(p.barcode || p.code || p.product_code || `P${String(p.id).padStart(4, '0')}`),
                    name: p.name || p.product_name,
                    price: parseFloat(p.price || p.selling_price || 0),
                    discountPercent: parseFloat(p.discount_percent || p.discount_rate || 0),
                    status: p.status ? p.status.toLowerCase() : 'active',
                    stock_quantity: p.stock_quantity !== undefined ? parseInt(p.stock_quantity, 10) : 0
                }));

                setAvailableProducts(updatedProducts);

                // 3. Next Voucher Pre-fetch
                fetchNextVoucherId();

                // 4. Trigger receipt print layout rendering
                handlePrintFn();
            }
        } catch (error) {
            console.error("Sale Process Backend Error:", error);
            const serverError = error.response?.data?.message || error.response?.data?.error || "Failed to process sale. Please try again.";
            toast.error(serverError);
        }
    };

    // Incremental validation controller
    const checkAndUpdateQty = (item, change) => {
        const currentQty = item.quantity;
        const newQty = currentQty + change;
        const stockLimit = item.stock_quantity ?? 0;

        if (change > 0 && newQty > stockLimit) {
            toast.error(`"${item.name}" cannot exceed the remaining stock of ${stockLimit}.`);
            return;
        }
        handleUpdateQty(item.id, change);
    };

    // Manual input box controller with fallback auto-corrector
    const checkAndDirectQtyChange = (item, rawValue) => {
        const stockLimit = item.stock_quantity ?? 0;

        if (rawValue === '') {
            handleDirectQtyChange(item.id, '');
            return;
        }

        const value = parseInt(rawValue, 10);

        if (!isNaN(value) && value > stockLimit) {
            toast.error(`Stock limit reached for "${item.name}". Quantity adjusted to ${stockLimit}.`);
            handleDirectQtyChange(item.id, stockLimit);
        } else {
            handleDirectQtyChange(item.id, rawValue);
        }
    };

    return (
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between max-h-screen h-auto sticky">

            {/* Hidden Printer Element Node Target */}
            <VoucherPrinter
                ref={printComponentRef}
                voucherId={voucherId}
                cartItems={cartItems}
                subtotal={subtotal}
                totalDiscount={totalDiscount}
                finalTotal={finalTotal}
                paymentMethod={paymentMethod}
                payAmount={isCashSelected ? payAmount : finalTotal}
                changeDue={changeDue}
            />

            <div className="flex flex-col flex-1 min-h-0 ">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100 mb-3">
                    <h3 className="text-xs font-black text-slate-900 tracking-wide uppercase flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
                        VOUCHER NO: {voucherId || 'N/A'}
                    </h3>
                    <button onClick={onClearAll} className="text-[10px] font-bold text-red-500 hover:underline">
                        Clear All
                    </button>
                </div>

                <div className="space-y-1.5 flex-1 overflow-y-auto pr-0.5 min-h-0 chunk-scrollbar">
                    {cartItems.map((item) => {
                        const itemDiscountPrice = item.price - (item.price * item.discountPercent / 100);
                        const itemFinalRowTotal = itemDiscountPrice * item.quantity;
                        const itemStock = item.stock_quantity ?? 0;

                        return (
                            <div
                                key={item.id}
                                className={`flex items-center justify-between p-2 rounded-lg border transition-all duration-300 ${(recentProductId && item.id && recentProductId === item.id)
                                    ? 'bg-emerald-50/70 border-emerald-400 ring-2 ring-emerald-100'
                                    : 'bg-white border-2 border-green-100'
                                    }`}
                            >
                                <div className="w-[45%]">
                                    <p className={`text-xs font-bold line-clamp-1 ${(recentProductId && item.id && recentProductId === item.id) ? 'text-emerald-800 font-extrabold' : 'text-slate-800'}`}>
                                        {item.name}
                                    </p>
                                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                        <p className="text-xs font-medium">
                                            {item.price.toLocaleString()} ks
                                        </p>
                                        {item.discountPercent > 0 && (
                                            <span className="text-red-500 text-xs font-medium bg-red-100 px-1 rounded-lg">
                                                -{item.discountPercent}%
                                            </span>
                                        )}
                                        <span className={`text-xs p-1 rounded-lg font-medium ${itemStock <= 10 ? 'bg-red-50 text-red-500' : 'bg-blue-100 text-blue-500'}`}>
                                            Stock: {itemStock}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <button onClick={() => checkAndUpdateQty(item, -1)} className="px-2.5 py-1 text-sm text-black font-bold">-</button>
                                    <input
                                        type="number"
                                        min="1"
                                        value={item.quantity === 0 ? '' : item.quantity}
                                        onChange={(e) => checkAndDirectQtyChange(item, e.target.value)}
                                        onBlur={() => { if (item.quantity === 0) handleDirectQtyChange(item.id, 1); }}
                                        className="w-8 text-xs font-sans font-bold text-slate-800 text-center focus:outline-none bg-transparent appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                    <button onClick={() => checkAndUpdateQty(item, 1)} className="px-2 py-1 text-sm text-black font-bold">+</button>
                                </div>

                                <div className="text-right font-sans text-xs font-bold text-slate-900 min-w-16.25">
                                    {itemFinalRowTotal.toLocaleString()} <span className="text-[9px] font-sans font-normal text-slate-400">Ks</span>
                                </div>

                                <button onClick={() => handleDeleteItem(item.id)} className="p-1 text-slate-400 hover:text-red-500 text-base font-medium leading-none">&times;</button>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="border-t-2 border-dashed border-slate-100 pt-3 mt-3 space-y-1.5 text-sm font-medium bg-white">
                <div className="flex justify-between text-xs my-2">
                    <span>Subtotal</span>
                    <span>{subtotal.toLocaleString()} Ks</span>
                </div>
                <div className="flex justify-between text-xs text-red-500 font-bold my-2">
                    <span>Discount</span>
                    <span>-{totalDiscount.toLocaleString()} Ks</span>
                </div>
                <div className="flex justify-between items-center my-2 pt-2 border-t-2 border-dashed border-slate-200 text-sm font-black text-slate-900">
                    <span>Total (Inclusive Tax):</span>
                    <span className="font-sans text-base text-emerald-600">{finalTotal.toLocaleString()} Ks</span>
                </div>
            </div>

            <div className="mt-1 pt-1.5 border-t-2 border-dashed border-slate-100 grid grid-cols-12 gap-2.5 flex items-center bg-white my-2">
                <div className="col-span-4 mt-2">
                    <label className="block text-xs font-black text-slate-900 mb-2">Method</label>
                    <select
                        value={paymentMethod}
                        onChange={(e) => {
                            setPaymentMethod(e.target.value);
                            setPayAmount('');
                        }}
                        className="w-full px-2 py-1 h-7 text-xs font-bold border rounded-md bg-white border-slate-200 focus:outline-none focus:border-emerald-500 text-slate-700 cursor-pointer shadow-xs"
                    >
                        {(dbPaymentMethods || []).map((method) => (
                            <option key={method.payment_id} value={method.payment_name}>
                                {method.payment_name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="col-span-8 grid grid-cols-2 gap-2 mt-2">
                    <div>
                        <label className="block text-xs font-black text-slate-900 mb-2">Pay Amount</label>
                        <input
                            type="text"
                            inputMode="decimal"
                            pattern="[0-9]*"
                            placeholder={isCashSelected ? "Enter Cash" : "0"}
                            className={`w-full px-2 py-0.5 h-7 text-xs font-sans font-bold border rounded-md focus:outline-none bg-white text-slate-800 border-slate-200 focus:border-emerald-500 ${!isCashSelected ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' : ''}`}
                            value={isCashSelected ? payAmount : finalTotal}
                            onChange={(e) => {
                                const value = e.target.value;
                                if(value === '' || /^\d*\.?\d*$/.test(value)) {
                                    setPayAmount(value);
                                }
                            }}
                            disabled={!isCashSelected}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-black text-slate-900 mb-2">Change Due</label>
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
                    className={`w-full py-2 px-4 rounded-lg font-bold text-xs border shadow-xs transition-all flex items-center justify-center gap-1.5 ${cartItems.length === 0
                            ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                            : 'bg-emerald-600 hover:bg-emerald-700 border-emerald-700 text-white active:scale-[0.99]'
                        }`}
                >
                    <BanknoteArrowDown className="w-5 h-5 me-1" />Pay & Print
                </button>
            </div>

        </div>
    );
};

export default Voucher;