import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, ShoppingBag } from "lucide-react";
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
    const [cartItems, setCartItems] = useState(() => {
        try {
            const savedCart = localStorage.getItem('mart4u_active_cart');
            return savedCart ? JSON.parse(savedCart) : [];
        } catch (error) {
            console.error("Error parsing cart from localStorage:", error);
            return [];
        }
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [recentProductId, setRecentProductId] = useState(null);
    const [voucherId, setVoucherId] = useState();

    // To save Payment Methods from the Database
    const [dbPaymentMethods, setDbPaymentMethods] = useState([]);

    // For real-time barcode
    const productRef = useRef(availableProducts);

    // Real-time listening for new product launches or changes
    useEffect(() => {
        if (window.Echo) {
            const channel = window.Echo.private('cashier.products')
                .listen('.ProductSaved', (data) => {
                    const incomingProduct = data.product;

                    const formattedProduct = {
                        id: Number(incomingProduct.product_id),
                        code: String(incomingProduct.barcode),
                        name: incomingProduct.product_name,
                        price: parseFloat(incomingProduct.price || 0),
                        discountPercent: parseFloat(incomingProduct.discount_rate || 0),
                        status: incomingProduct.status ? incomingProduct.status.toLowerCase() : 'active',
                        stock_quantity: incomingProduct.stock_quantity !== undefined ? parseInt(incomingProduct.stock_quantity, 10) : 0
                    };

                    const isExisting = productRef.current.some(p => p.id === formattedProduct.id);

                    if (isExisting) {
                        toast.success(`"${formattedProduct.name}" has been updated.`);
                    } else {
                        toast.success(`New product added: "${formattedProduct.name}"`);
                    }

                    setAvailableProducts((prevProducts) => {
                        // If it's an existing product, it will be updated, if it's a new product, it will be appended.
                        const isExisting = prevProducts.some(p => p.id === formattedProduct.id);

                        if (isExisting) {
                            return prevProducts.map(p => p.id === formattedProduct.id ? formattedProduct : p);
                        } else {
                            // Real-time instant appearance at the top of the product list
                            return [formattedProduct, ...prevProducts];
                        }
                    });
                });

            // Disable channel listening when component is unmounted
            return () => {
                channel.stopListening('.ProductSaved');
            };
        }
    }, []);

    useEffect(() => {
        productRef.current = availableProducts;
    }, [availableProducts]);

    useEffect(() => {
        localStorage.setItem('mart4u_active_cart', JSON.stringify(cartItems));
    }, [cartItems]);

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

                setCartItems(prevItems => {
                    let isStale = false;
                    const updatedItems = prevItems.map(item => {
                        const freshProduct = availableProducts.find(product => product.id === item.id);
                        if (freshProduct) {
                            // Check if critical POS values have changed in DB while cashier was away
                            if (item.price !== freshProduct.price || item.discountPercent !== freshProduct.discountPercent || item.stock_quantity !== freshProduct.stock_quantity) {
                                isStale = true;
                                // Keep the cashier's chosen quantity, but update backend constraints
                                return {
                                    ...item,
                                    price: freshProduct.price,
                                    discountPercent: freshProduct.discountPercent,
                                    stock_quantity: freshProduct.stock_quantity
                                };
                            }
                        }
                        return item;
                    });
                    return isStale ? updatedItems : prevItems;
                });
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
                    toast.error(`"${matchedProduct.name}" cannot be added.`);
                    return;
                }

                setRecentProductId(matchedProduct.id);
                setCartItems((prev) => {
                    const exist = prev.find((item) => item.id === matchedProduct.id);
                    const currentQty = exist ? exist.quantity : 0;

                    if (currentQty + 1 > matchedProduct.stock_quantity) {
                        toast.error(`"${matchedProduct.name}" exceeds the available stock ${matchedProduct.stock_quantity} `);
                        return prev;
                    }

                    if (exist) {
                        return prev.map((item) => item.id === matchedProduct.id ? { ...item, quantity: item.quantity + 1 } : item);
                    }
                    return [...prev, { ...matchedProduct, quantity: 1 }];
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
            toast.error(`"${product.name}" is inactive`);
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

    return (
        <div className="w-full min-h-screen bg-[#F8FAFC] font-sans flex text-slate-800 antialiased px-4 pt-0 pb-4 relative">
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
                                <span className="text-xs font-semibold bg-emerald-200 text-slate-700 px-2 py-1 rounded-full">
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

                                        <div className="flex flex-col items-center justify-center py-16 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                            <ShoppingBag className="w-7 h-7 text-emerald-600 mb-2" />
                                            <p className="text-sm font-medium text-slate-800">No products found matching</p>
                                            <p className="mt-1 text-sm font-bold text-emerald-600">"{searchQuery}"</p>
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