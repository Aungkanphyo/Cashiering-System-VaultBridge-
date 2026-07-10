import { useState, useEffect, useRef } from 'react';
import api from '../../api/axios';
import Voucher from './Voucher'; // voucher import for right column
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const SaleWorkspace = () => {
    // --- States for Backend API Integration ---
    const [availableProducts, setAvailableProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Current Cart Setup
    const [cartItems, setCartItems] = useState([]);

    const [searchQuery, setSearchQuery] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [payAmount, setPayAmount] = useState('');
    const [recentProductId, setRecentProductId] = useState(null);

    const [voucherId, setVoucherId] = useState();

    // For real-time barcode
    const productRef = useRef(availableProducts);

    useEffect(() => {
        productRef.current = availableProducts;
    }, [availableProducts]);

    useEffect(() => {
        fetchNextVoucherId();
    }, []);

    const fetchNextVoucherId = async () => {
        try {
            const response = await api.get('/vouchers/next-id');
            if (response.data && response.data.success) {
                setVoucherId(Number(response.data.next_voucher_id));
            }
        } catch (err) {
            console.error("Error fetching next voucher ID, using default 1001:", err);
            setVoucherId(1001);
        }
    };

    // --- Laravel API (Fetch Products) ---  
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = await api.get('/products');
                const data = response.data;

                const formattedProducts = data.map((product, index) => {
                    const productId = product.id ? Number(product.id) : (product.product_id ? Number(product.product_id) : (index + 1));
                    return {
                        id: productId,
                        code: product.barcode || product.code || product.product_code || `P${String(productId).padStart(4, '0')}`,
                        name: product.name || product.product_name,
                        price: parseFloat(product.price || product.selling_price || 0),
                        discountPercent: parseFloat(product.discount_percent || product.discount_rate || 0),
                        status: product.status ? product.status.toLowerCase() : 'active'
                    };
                });

                setAvailableProducts(formattedProducts);
                setError(null);
            } catch (err) {
                console.error("API Error via Axios:", err);
                const errorMsg = err.response?.data?.message || err.message || 'Failed to fetch products.';
                setError(errorMsg);
            } finally {
                loading && setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // Socket.io integration for barcode scanner
    useEffect(() => {
        const socket = io('http://localhost:5000');

        socket.on('display-barcode', (scannedBarcode) => {
            console.log("Barcode received from phone:", scannedBarcode);
            const cleanBarcode = scannedBarcode.trim();

            const matchedProduct = productRef.current.find(
                (product) => product.code && product.code.trim() === cleanBarcode
            );

            if(matchedProduct) {
                if (matchedProduct.status === 'inactive') {
                    toast.error(`"${matchedProduct.name}" cannot be added.`);
                    return;
                }

                setRecentProductId(matchedProduct.id);
                setCartItems((prev) => {
                    const exist = prev.find((item) => item.id === matchedProduct.id);
                    if(exist) {
                        return prev.map((item) => item.id === matchedProduct.id ? { ...item, quantity: item.quantity + 1 } : item);
                    }
                    return [...prev, {...matchedProduct, quantity: 1}];
                });

                toast.success(`Scanned: ${matchedProduct.name} added to cart.`);
            } else {
                toast.error(`Product Code [${cleanBarcode}] Not Found in Database!`);
            }
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    // Search / Filter Logic 
    const filteredProducts = availableProducts.filter(product => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return true;
        return (
            product.name?.toLowerCase().includes(query) ||
            product.code?.toLowerCase().includes(query)
        );
    });

    // --- Calculation Logics ---
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalDiscount = cartItems.reduce((sum, item) => sum + ((item.price * item.discountPercent / 100) * item.quantity), 0);
    const finalTotal = subtotal - totalDiscount;

    const currentPayAmount = paymentMethod === 'KPay' ? finalTotal : (parseFloat(payAmount) || 0);
    const changeDue = currentPayAmount > finalTotal ? currentPayAmount - finalTotal : 0;

    const handleUpdateQty = (id, delta) => {
        setRecentProductId(id);
        setCartItems(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = item.quantity + delta;
                return newQty > 0 ? { ...item, quantity: newQty } : item;
            }
            return item;
        }));
    };

    const handleDirectQtyChange = (id, value) => {
        setRecentProductId(id);
        const parsedQty = parseInt(value, 10);
        setCartItems(prev => prev.map(item => {
            if (item.id === id) {
                return { ...item, quantity: isNaN(parsedQty) || parsedQty < 0 ? 0 : parsedQty };
            }
            return item;
        }));
    };

    const handleDeleteItem = (id) => {
        setCartItems(prev => prev.filter(item => item.id !== id));
        if (recentProductId === id) {
            setRecentProductId(null);
        }
    };

    const handleAddProduct = (product) => {
        if (product.status === 'inactive') {
            toast.error(`"${product.name}" is inactive`);
            return;
        }

        setRecentProductId(product.id);
        setCartItems(prev => {
            const exist = prev.find(item => item.id === product.id);
            if (exist) {
                return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, { ...product, quantity: 1 }];
        });
        setSearchQuery('');
    };

    const handleClearCart = () => {
        setCartItems([]);
        setPayAmount('');
        setRecentProductId(null);
    };

    // --- 🎯 Process Sale with Laravel API Integration ---
    const handleProcessSale = async () => {
        if (cartItems.length === 0) {
            toast.error('No products in the cart to process sale.');
            return;
        }

        if (paymentMethod === 'Cash') {
            if (!payAmount || parseFloat(payAmount) <= 0) {
                toast.error('Please enter a valid payment amount.');
                return;
            }

            if (parseFloat(payAmount) < finalTotal) {
                toast.error('Payment amount is less than the total amount due.');
                return;
            }
        }

        // Payload Framework 
        const salePayload = {
            session_id: 2, // temporary static for session_id 
            payment_id: paymentMethod === 'Cash' ? 1 : 2, 
            sale_date: new Date().toISOString().slice(0, 19).replace('T', ' '), // YYYY-MM-DD HH:MM:SS
            status: 'completed',
            change: changeDue,
            payment_received: paymentMethod === 'KPay' ? finalTotal : parseFloat(payAmount), 
            
            items: cartItems.map(item => {
                const discountAmount = (item.price * (item.discountPercent || 0)) / 100;
                const finalItemPrice = item.price - discountAmount;
                return {
                    product_id: Number(item.id),
                    quantity: parseInt(item.quantity, 10),
                    sub_total: item.price * item.quantity,
                    unit_price: item.price,              
                    total: finalItemPrice * item.quantity 
                };
            })
        };

        try {
            const response = await api.post('/vouchers', salePayload);

            if (response.status === 200 || response.status === 201 || response.data.success) {
                
                fetchNextVoucherId();                
            }
        } catch (error) {
            console.error("Sale Process Backend Error:", error);
            const serverError = error.response?.data?.message || error.response?.data?.error || "Failed to process sale. Please try again.";
            toast.error(serverError);
            throw error; // Re-throwing for potential further handling
        }
    };

    return (
        <div className="w-full min-h-screen bg-[#F8FAFC] font-sans flex text-slate-800 antialiased px-4 pt-0 pb-4 relative">
            <div className="flex-1 flex flex-col overflow-y-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start flex-1 mt-2">

                    {/* LEFT COLUMN: CATALOG & SEARCH BAR */}
                    <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col">
                        <div className="relative w-full mb-6">
                            <span className="absolute left-4 top-3.5 text-slate-400 text-base">🔍</span>
                            <input
                                type="text"
                                disabled={loading || !!error}
                                placeholder={error ? "Cannot search due to server error..." : "Search product name or barcode..."}
                                className="w-full pl-11 pr-4 py-3 text-sm font-medium border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all text-slate-700 shadow-inner disabled:opacity-60"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                {searchQuery.trim() ? "SEARCH RESULTS" : "QUICK CLICK ITEMS"}
                            </h3>
                            {!loading && !error && (
                                <span className="text-[11px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                                    {filteredProducts.length} Items
                                </span>
                            )}
                        </div>

                        <div className="max-h-105 overflow-y-auto pr-1 chunk-scrollbar flex-1">
                            {loading && <div className="text-center py-12 text-sm text-slate-500 animate-pulse">Loading products...</div>}
                            {error && <div className="p-4 text-center text-red-600 bg-red-50 border border-red-100 rounded-xl text-sm">⚠️ {error}</div>}

                            {!loading && !error && (
                                <>
                                    {filteredProducts.length > 0 ? (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 p-0.5">
                                            {filteredProducts.map(p => {
                                                const isRecent = recentProductId && p.id && recentProductId === p.id;
                                                const isInactive = p.status === 'inactive';

                                                return (
                                                    <button
                                                        key={p.id}
                                                        onClick={() => handleAddProduct(p)}
                                                        disabled={isInactive}
                                                        className={`relative border rounded-xl text-left p-4 transition-all duration-200 flex flex-col justify-between h-30 group transform select-none ${
                                                            isInactive
                                                                ? 'bg-slate-100 border-slate-200 opacity-50 cursor-not-allowed shadow-none' 
                                                                : isRecent
                                                                ? 'bg-emerald-50/40 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
                                                                : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]'
                                                        }`}
                                                    >
                                                        <div className="w-full">
                                                            <h4 className={`text-[13px] font-bold leading-snug tracking-tight transition-colors line-clamp-2 ${
                                                                isInactive ? 'text-slate-400' : isRecent ? 'text-emerald-800' : 'text-slate-700 group-hover:text-emerald-600'
                                                            }`}>
                                                                {p.name}
                                                            </h4>
                                                        </div>

                                                        <div className="w-full mt-auto pt-2 flex flex-col gap-1.5">
                                                            <div className="h-5 flex items-center">
                                                                {isInactive ? (
                                                                    <span className="text-[10px] font-extrabold bg-red-50 text-red-600 px-1.5 py-0.5 rounded border border-red-200 uppercase tracking-wider">
                                                                        Inactive
                                                                    </span>
                                                                ) : p.discountPercent > 0 ? (
                                                                    <span className="text-[10px] font-extrabold bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded border border-rose-100 uppercase tracking-wider animate-pulse">
                                                                        {p.discountPercent}%
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-[10px] font-medium text-slate-300 opacity-0 select-none">No Disc</span>
                                                                )}
                                                            </div>

                                                            <div className="flex items-baseline justify-between w-full">
                                                                <div className={`text-sm font-black font-sans tracking-tight ${
                                                                    isInactive ? 'text-slate-400' : isRecent ? 'text-emerald-600' : 'text-slate-900'
                                                                }`}>
                                                                    {p.price.toLocaleString()} <span className="text-[10px] font-normal text-slate-400">Ks</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center py-16 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                            <span className="text-2xl block mb-2">📦</span>
                                            <div className="text-sm text-slate-400 font-medium">
                                                No products found matching "{searchQuery}"
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN */}
                    <Voucher
                        voucherId={voucherId}
                        cartItems={cartItems}
                        recentProductId={recentProductId}
                        subtotal={subtotal}
                        totalDiscount={totalDiscount}
                        finalTotal={finalTotal}
                        paymentMethod={paymentMethod}
                        payAmount={payAmount}
                        changeDue={changeDue}
                        setPaymentMethod={setPaymentMethod}
                        setPayAmount={setPayAmount}
                        handleUpdateQty={handleUpdateQty}
                        handleDirectQtyChange={handleDirectQtyChange}
                        handleDeleteItem={handleDeleteItem}
                        handleClearCart={handleClearCart}
                        handleProcessSale={handleProcessSale}
                    />

                </div>
            </div>
        </div>
    );
};

export default SaleWorkspace;