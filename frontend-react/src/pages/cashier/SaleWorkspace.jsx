import { useState, useEffect, useRef, useCallback } from 'react';
import { Search } from "lucide-react";
import api from '../../api/axios';
import Voucher from './Voucher'; // voucher import for right column
import { io } from 'socket.io-client';
import { CheckCircle, XCircle } from "lucide-react";

// --- Inline Custom Toast Component ---
const Toast = ({ message, type = "success" }) => {
    if (!message) return null;
    const isError = type === "error";

    return (
        <div
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-[60] flex items-center p-4 text-sm rounded-lg border shadow-lg transition-all duration-300 ${
                isError
                    ? "text-rose-800 bg-rose-100 border-rose-300"
                    : "text-emerald-800 bg-emerald-100 border-emerald-300"
            }`}
        >
            {isError ? (
                <XCircle className="w-5 h-5 mr-2 text-rose-600" />
            ) : (
                <CheckCircle className="w-5 h-5 mr-2 text-emerald-600" />
            )}
            <span className="font-medium">{message}</span>
        </div>
    );
};

const SaleWorkspace = () => {
    // --- States for Backend API Integration ---
    const [availableProducts, setAvailableProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Current Cart Setup
    const [cartItems, setCartItems] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [recentProductId, setRecentProductId] = useState(null);
    const [voucherId, setVoucherId] = useState();

    // To save Payment Methods from the Database
    const [dbPaymentMethods, setDbPaymentMethods] = useState([]);

    // Custom Toast Notification States
    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] = useState("success");

    // Helper function to trigger our custom toast with an auto-hide timeout
    const showNotification = (message, type = "success") => {
        setToastMessage(message);
        setToastType(type);
    };

    // Auto-clear notification after 4 seconds
    useEffect(() => {
        if (toastMessage) {
            const timer = setTimeout(() => {
                setToastMessage("");
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [toastMessage]);

    // For real-time barcode
    const productRef = useRef(availableProducts);

    useEffect(() => {
        productRef.current = availableProducts;
    }, [availableProducts]);

    const fetchNextVoucherId = useCallback(async () => {
        try {
            const response = await api.get('/vouchers/next-id');
            if (response.data && response.data.success) {
                setVoucherId(Number(response.data.next_voucher_id));
            }
        } catch (err) {
            console.error("Error fetching next voucher ID", err);
        }
    }, []);

    const fetchPaymentMethods = useCallback(async () => {
        try {
            const response = await api.get('/payment-methods');
            setDbPaymentMethods(response.data || []);
        } catch (err) {
            console.error("Error fetching payment methods:", err);
        }
    }, []);

    useEffect(() => {
        const initializeData = async () => {
            fetchNextVoucherId();
            fetchPaymentMethods();
        };

        initializeData();
    }, [fetchNextVoucherId, fetchPaymentMethods]);

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
                        code: String(product.barcode || product.code || product.product_code || `P${String(productId).padStart(4, '0')}`),
                        name: product.name || product.product_name,
                        price: parseFloat(product.price || product.selling_price || 0),
                        discountPercent: parseFloat(product.discount_percent || product.discount_rate || 0),
                        status: product.status ? product.status.toLowerCase() : 'active',
                        stock_quantity: product.stock_quantity !== undefined ? parseInt(product.stock_quantity, 10) : 0
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
            const cleanBarcode = scannedBarcode.trim();

            const matchedProduct = productRef.current.find(
                (product) => product.code && product.code.trim() === cleanBarcode
            );

            if (matchedProduct) {
                if (matchedProduct.status === 'inactive') {
                    showNotification(`"${matchedProduct.name}" cannot be added.`, "error");
                    return;
                }

                setRecentProductId(matchedProduct.id);
                setCartItems((prev) => {
                    const exist = prev.find((item) => item.id === matchedProduct.id);
                    const currentQty = exist ? exist.quantity : 0;

                    if (currentQty + 1 > matchedProduct.stock_quantity) {
                        toast.error(`"${product.name}" exceeds the available stock ${product.stock_quantity} `);
                        return prev;
                    }

                    if (exist) {
                        return prev.map((item) => item.id === matchedProduct.id ? { ...item, quantity: item.quantity + 1 } : item);
                    }
                    return [...prev, { ...matchedProduct, quantity: 1 }];
                });

                showNotification(`Scanned: ${matchedProduct.name} added to cart.`, "success");
            } else {
                showNotification(`Product Code [${cleanBarcode}] Not Found in Database!`, "error");
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

    // Cart Qty Event Handlers
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

    // Quick Click Item 
    const handleAddProduct = (product) => {
        if (product.status === 'inactive') {
            showNotification(`"${product.name}" is inactive`, "error");
            return;
        }

       
        const existItem = cartItems.find(item => item.id === product.id);
        const currentQty = existItem ? existItem.quantity : 0;

        if (currentQty + 1 > product.stock_quantity) {
            toast.error(`"${product.name}" exceeds the available stock ${product.stock_quantity} `);
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
        setRecentProductId(null);
    };

    // Process Sale with Laravel API Integration ---
    const handleProcessSale = async () => {
        if (cartItems.length === 0) {
            showNotification('No products in the cart to process sale.', "error");
            return;
        }

        // Validation check only if you cash
        if (isCashSelected) {
            if (!payAmount || parseFloat(payAmount) <= 0) {
                showNotification('Please enter a valid payment amount.', "error");
                return;
            }

            if (parseFloat(payAmount) < finalTotal) {
                showNotification('Payment amount is less than the total amount due.', "error");
                return;
            }
        }

        const matchedPaymentObj = dbPaymentMethods.find(
            method => method.payment_name.toLowerCase() === paymentMethod.toLowerCase()
        );

        if (!matchedPaymentObj) {
            showNotification(`The selected payment method [${paymentMethod}] was not found in the database.`, "error");
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
            const response = await api.post('/vouchers', salePayload);

            if (response.status === 200 || response.status === 201 || response.data.success) {
                showNotification(`Transaction is successfully completed!`, "success");
                fetchNextVoucherId();
                handleClearCart();
            }
        } catch (error) {
            console.error("Sale Process Backend Error:", error);
            const serverError = error.response?.data?.message || error.response?.data?.error || "Failed to process sale. Please try again.";
            showNotification(serverError, "error");
            throw error; 
        }
    };

    return (
        <div className="w-full min-h-screen bg-[#F8FAFC] font-sans flex text-slate-800 antialiased px-4 pt-0 pb-4 relative">
            {/* Custom App Toast Notification Panel */}
            <Toast message={toastMessage} type={toastType} />

            <div className="flex-1 flex flex-col overflow-y-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start flex-1 mt-2">

                    {/* LEFT COLUMN: CATALOG & SEARCH BAR */}
                    <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col">
                        <div className="relative w-full mb-6">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                disabled={loading || !!error}
                                placeholder={error ? "Cannot search due to server error..." : "Search product name or barcode..."}
                                className="w-full pl-9 pr-3 py-2 text-sm font-medium border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all text-slate-700 shadow-inner disabled:opacity-60"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-emerald-600 uppercase ">
                                {searchQuery.trim() ? "SEARCH RESULTS" : "QUICK CLICK ITEMS"}
                            </h3>
                            {!loading && !error && (
                                <span className="text-xs font-semibold bg-green-200 text-slate-700 px-2 py-0.5 rounded-full">
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
                                                        className={`relative border rounded-xl text-left p-4 transition-all duration-200 flex flex-col justify-between h-30 group transform select-none ${isInactive
                                                            ? 'bg-slate-100 border-slate-200 opacity-50 cursor-not-allowed shadow-none'
                                                            : isRecent
                                                                ? 'bg-emerald-50/40 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
                                                                : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]'
                                                            }`}
                                                    >
                                                        <div className="w-full">
                                                            <h4 className={`text-[13px] font-bold leading-snug tracking-tight transition-colors line-clamp-2 ${isInactive ? 'text-slate-400' : isRecent ? 'text-emerald-800' : 'text-slate-700 group-hover:text-emerald-600'
                                                                }`}>
                                                                {p.name}
                                                            </h4>
                                                        </div>

                                                        <div className="w-full mt-auto pt-2 flex flex-col gap-1.5">
                                                            <div className="h-5 flex items-center gap-1">
                                                                {isInactive ? (
                                                                    <span className="text-[10px] font-extrabold bg-red-50 text-red-600 px-1.5 py-0.5 rounded border border-red-200 uppercase tracking-wider">
                                                                        Inactive
                                                                    </span>
                                                                ) : p.discountPercent > 0 ? (
                                                                    <span className="text-[10px] font-extrabold bg-red-100 text-red-500 px-1.5 py-0.5 rounded border border-rose-100 uppercase tracking-wider animate-pulse">
                                                                        {p.discountPercent}%
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-[10px] font-medium text-slate-300 opacity-0 select-none">No Disc</span>
                                                                )}
                                                            </div>

                                                            <div className="flex items-baseline justify-between w-full">
                                                                <div className={`text-sm font-black font-sans tracking-tight ${isInactive ? 'text-slate-400' : isRecent ? 'text-emerald-600' : 'text-slate-900'
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

                    {/* RIGHT COLUMN: VOUCHER COMPONENT (Refactored) */}
                    <Voucher
                        voucherId={voucherId}
                        cartItems={cartItems}
                        recentProductId={recentProductId}
                        handleUpdateQty={handleUpdateQty}
                        handleDirectQtyChange={handleDirectQtyChange}
                        handleDeleteItem={handleDeleteItem}
                        handleClearCart={handleClearCart}
                        dbPaymentMethods={dbPaymentMethods}
                        fetchNextVoucherId={fetchNextVoucherId}
                        setAvailableProducts={setAvailableProducts}
                    />

                </div>
            </div>
        </div>
    );
};

export default SaleWorkspace;
