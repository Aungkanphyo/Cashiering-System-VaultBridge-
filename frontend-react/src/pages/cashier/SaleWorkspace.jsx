import React, { useState, useRef, useEffect } from 'react';

const SaleWorkspace = () => {
  // --- States for Backend API Integration ---
  const [availableProducts, setAvailableProducts] = useState([]); // API ကလာမည့် ပစ္စည်းစာရင်း
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error handling state

  // Current Cart Setup
  const [cartItems, setCartItems] = useState([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [payAmount, setPayAmount] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [recentProductId, setRecentProductId] = useState(null); 
  const [showToast, setShowToast] = useState(false); 
  const [voucherId, setVoucherId] = useState(1001); 
  const dropdownRef = useRef(null);

  // --- Laravel API မှ Data ဆွဲယူခြင်း (Fetch Products) ---
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        const response = await fetch('http://localhost:8000/api/products', {
          headers: {
            'Accept': 'application/json',
          }
        }); 
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('The route api/products could not be found.');
          }
          throw new Error('Failed to fetch products from backend server.');
        }

        const data = await response.json();
        
        const formattedProducts = data.map((product, index) => {
        // Laravel ဘက်က product_id သို့မဟုတ် id ဘာလာလာ စိတ်ချရအောင် ယူခြင်း
        const productId = product.id || product.product_id || (index + 1); 
        
        return {
          id: productId,
          // #Pundefined မဖြစ်စေဘဲ စိတ်ချရသော code ပုံစံထုတ်ခြင်း
          code: product.code || product.product_code || `P${String(productId).padStart(4, '0')}`,
          name: product.name || product.product_name,
          price: parseFloat(product.price || product.selling_price || 0),
          discountPercent: parseFloat(product.discount_percent || 0)
        };
      });

        setAvailableProducts(formattedProducts);
        setError(null);
      } catch (err) {
        console.error("API Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Search Logic
  const filteredProducts = availableProducts.filter(product => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true; 
    return (
      product.name?.toLowerCase().includes(query) || 
      product.code?.toLowerCase().includes(query)
    );
  });

  // Dropdown Click Outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Math Computations
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalDiscount = cartItems.reduce((sum, item) => sum + ((item.price * item.discountPercent / 100) * item.quantity), 0); 
  const finalTotal = subtotal - totalDiscount;

  const currentPayAmount = paymentMethod === 'KPay' ? finalTotal : (parseFloat(payAmount) || 0);
  const changeDue = currentPayAmount > finalTotal ? currentPayAmount - finalTotal : 0;

  // Handle Qty via Buttons (+/-)
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

  // Handle Direct Qty Input Change
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

  // Delete Individual Item
  const handleDeleteItem = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
    if (recentProductId === id) {
      setRecentProductId(null);
    }
  };

  // Quick Click & Search Add
  const handleAddProduct = (product) => {
    setRecentProductId(product.id);
    setCartItems(prev => {
      const exist = prev.find(item => item.id === product.id);
      if (exist) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setSearchQuery(''); 
    setShowDropdown(false);
  };

  const handleClearCart = () => {
    setCartItems([]);
    setPayAmount('');
    setRecentProductId(null);
  };

  // Handle Pay Action
  const handleProcessSale = () => {
    if (cartItems.length === 0) return;
    
    setShowToast(true);
    setVoucherId(prevId => prevId + 1);
    handleClearCart();
  };

  // Auto-hide banner after 3.5 seconds
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] font-sans flex text-slate-800 antialiased px-4 pt-0 pb-4 relative">
      
      {/* STATIC CONFIRM PAY TOAST BANNER (NO BOUNCE) */}
      {showToast && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-slate-800 transition-all duration-300">
          <div className="h-6 w-6 rounded-full bg-emerald-500 flex items-center justify-center text-xs text-white font-bold">
            ✓
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-black tracking-wide text-emerald-400 uppercase">Sales Successful</span>
            <span className="text-[11px] text-slate-400 font-medium">Transaction has been completed successfully.</span>
          </div>
          <button 
            onClick={() => setShowToast(false)} 
            className="ml-2 text-slate-500 hover:text-slate-300 text-lg font-bold"
          >
            &times;
          </button>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-y-auto">
        
        {/* WORKSPACE CONTENT SPLIT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start flex-1 mt-2">
          
          {/* LEFT COLUMN: CATALOG & SEARCH BAR (7 COLS) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            
            {/* Search Bar Area */}
            <div className="relative w-full mb-6" ref={dropdownRef}>
              <span className="absolute left-4 top-3 text-slate-400 text-lg">🔍</span>
              <input
                type="text"
                disabled={loading || !!error}
                placeholder={error ? "Cannot search due to server error..." : "Search product name or barcode..."}
                className="w-full pl-11 pr-4 py-3 text-base font-medium border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-50 transition-all text-slate-700 shadow-inner disabled:opacity-60"
                value={searchQuery}
                onFocus={() => setShowDropdown(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowDropdown(true);
                }}
              />

              {/* SEARCH DROPDOWN LIST */}
              {showDropdown && searchQuery.trim().length > 0 && !loading && !error && (
                <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto divide-y divide-slate-100">
                  {filteredProducts.map(p => (
                    <div
                      key={p.id}
                      onClick={() => handleAddProduct(p)}
                      className="flex items-center justify-between p-3 hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800">{p.name}</span>
                        <span className="text-xs font-sans text-slate-400">#{p.code}</span>
                      </div>
                      <div className="text-right flex items-center gap-2">
                        {p.discountPercent > 0 && (
                          <span className="bg-red-50 text-red-600 font-sans text-[10px] font-bold px-1.5 py-0.5 rounded border border-red-100">
                            -{p.discountPercent}%
                          </span>
                        )}
                        <span className="text-sm font-black text-slate-900 font-sans">
                          {p.price.toLocaleString()} Ks
                        </span>
                      </div>
                    </div>
                  ))}
                  {filteredProducts.length === 0 && (
                    <div className="p-4 text-center text-sm text-slate-400">
                      No results for "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Section Title */}
            <div className="mb-4">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                QUICK CLICK ITEMS
              </h3>
            </div>

            {/* Catalog Grid Container with Fixed Height & Scrollbar */}
            <div className="max-h-[380px] overflow-y-auto pr-1 chunk-scrollbar">
              
              {/* 1. Loading UI */}
              {loading && (
                <div className="text-center py-12 text-sm font-medium text-slate-500 flex flex-col items-center justify-center gap-2">
                  <span className="animate-spin text-xl">⏳</span>
                  <span>Loading products from backend...</span>
                </div>
              )}

              {/* 2. Error Display UI (As requested in image_b342bd.jpg) */}
              {error && (
                <div className="flex items-center justify-center p-6 my-4 bg-red-50/50 border border-red-100 rounded-xl text-red-600 font-medium text-sm gap-2">
                  <span>⚠️</span> {error}
                </div>
              )}

              {/* 3. Success Grid Render */}
              {!loading && !error && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {filteredProducts.map(p => (
                    <button
                      key={p.id}
                      onClick={() => handleAddProduct(p)}
                      className={`relative border-2 p-4 rounded-xl text-left transition-all shadow-sm hover:shadow-md active:scale-95 flex flex-col justify-between h-36 group ${
                        recentProductId === p.id 
                          ? 'bg-emerald-50/40 border-emerald-500' 
                          : 'bg-white border-slate-100 hover:border-emerald-500'
                      }`}
                    >
                      {p.discountPercent > 0 && (
                        <span className="absolute top-20 bg-red-50 text-red-600 font-sans text-xs font-extrabold px-1.5 py-0.5 ">
                          -{p.discountPercent}%
                        </span>
                      )}
                      
                      <div>
                        <h4 className={`text-sm font-bold transition-colors line-clamp-2 leading-snug ${
                          recentProductId === p.id ? 'text-emerald-700' : 'text-slate-800 group-hover:text-emerald-700'
                        }`}>
                          {p.name}
                        </h4>
                        <p className="text-xs font-sans font-medium text-slate-400 mt-1">
                          #{p.code}
                        </p>
                      </div>

                      <div className="text-sm font-extrabold text-slate-900 font-sans mt-2">
                        {p.price.toLocaleString()} <span className="text-xs font-sans font-normal text-slate-400">Ks</span>
                      </div>
                    </button>
                  ))}
                  
                  {filteredProducts.length === 0 && (
                    <div className="col-span-full text-center py-8 text-sm font-medium text-slate-400">
                      No products found matching "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: ACTIVE CART & PAYMENT (5 COLS) */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between h-[calc(100vh-16px)] sticky top-0">
            
            {/* Basket Listing */}
            <div className="flex flex-col flex-1 min-h-0">
              
              {/* Voucher No Title Box */}
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 mb-3">
                <h3 className="text-xs font-black text-slate-900 tracking-wide uppercase flex items-center gap-1.5">
                   <span className="h-1.5 w-1.5 rounded-full bg-emerald-600"></span> 
                   Voucher No: #{voucherId}
                </h3>
                <button 
                  onClick={handleClearCart}
                  className="text-[10px] font-bold text-red-500 hover:underline"
                >
                  Clear All
                </button>
              </div>

              {/* Items Render Rows */}
              <div className="space-y-1.5 flex-1 overflow-y-auto pr-0.5 min-h-0">
                {cartItems.map((item) => (
                  <div 
                    key={item.id} 
                    className={`flex items-center justify-between p-2 rounded-lg border transition-all duration-300 ${
                      recentProductId === item.id 
                        ? 'bg-emerald-50/70 border-emerald-400 ring-2 ring-emerald-100' 
                        : 'bg-slate-50 border-slate-100'
                    }`}
                  >
                    <div className="w-[42%]">
                      <p className={`text-xs font-bold line-clamp-1 ${
                        recentProductId === item.id ? 'text-emerald-800 font-extrabold' : 'text-slate-800'
                      }`}>
                        {item.name}
                      </p>
                      
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <p className="text-[9px] text-slate-400 font-sans font-medium">
                          {item.price.toLocaleString()} ks
                        </p>
                        {item.discountPercent > 0 && (
                          <span className="bg-red-50 text-red-600 font-sans text-[9px] font-extrabold px-1 ">
                            -{item.discountPercent}%
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity Input Selector */}
                    <div className="flex items-center border border-slate-200 bg-white rounded-md overflow-hidden">
                      <button 
                        onClick={() => handleUpdateQty(item.id, -1)}
                        className="px-1.5 py-0.5 text-[10px] bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity === 0 ? '' : item.quantity}
                        onChange={(e) => handleDirectQtyChange(item.id, e.target.value)}
                        onBlur={() => {
                          if (item.quantity === 0) handleDirectQtyChange(item.id, 1);
                        }}
                        className="w-8 text-[11px] font-sans font-bold text-slate-800 text-center focus:outline-none bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button 
                        onClick={() => handleUpdateQty(item.id, 1)}
                        className="px-1.5 py-0.5 text-[10px] bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold"
                      >
                        +
                      </button>
                    </div>

                    {/* Pricing Column */}
                    <div className="text-right font-sans text-xs font-bold text-slate-900 min-w-[55px]">
                      {((item.price - (item.price * item.discountPercent / 100)) * item.quantity).toLocaleString()} <span className="text-[9px] font-sans font-normal text-slate-400">Ks</span>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-1 text-slate-400 hover:text-red-500 font-sans text-base font-medium rounded-md hover:bg-red-50 active:scale-95 transition-all leading-none ml-0.5"
                      title="Remove item"
                    >
                      &times;
                    </button>
                  </div>
                ))}
                
                {cartItems.length === 0 && (
                  <div className="text-center py-8 text-xs text-slate-400 font-medium">
                    Your cart is empty.
                  </div>
                )}
              </div>
            </div>

            {/* Bill Statement Box */}
            <div className="border-t border-slate-100 pt-3 mt-3 space-y-1.5 text-xs font-medium bg-white">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal:</span>
                <span className="font-sans text-slate-800">{subtotal.toLocaleString()} Ks</span>
              </div>
              <div className="flex justify-between text-red-500">
                <span>Discount:</span>
                <span className="font-sans">-{totalDiscount.toLocaleString()} Ks</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-dashed border-slate-200 text-sm font-black text-slate-900">
                <span>Total (Inclusive Tax):</span>
                <span className="font-sans text-sm text-emerald-600">{finalTotal.toLocaleString()} Ks</span>
              </div>
            </div>

            {/* PAYMENT SELECTOR */}
            <div className="mt-3 pt-2 border-t border-slate-100 grid grid-cols-12 gap-2.5 items-center bg-white">
              <div className="col-span-4">
                <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">
                  Method
                </label>
                <div className="flex gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                  <button
                    onClick={() => setPaymentMethod('Cash')}
                    className={`flex-1 py-1 text-[9px] font-bold rounded-md transition-all ${
                      paymentMethod === 'Cash' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    💵 Cash
                  </button>
                  <button
                    onClick={() => setPaymentMethod('KPay')}
                    className={`flex-1 py-1 text-[9px] font-bold rounded-md transition-all ${
                      paymentMethod === 'KPay' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    📱 KPay
                  </button>
                </div>
              </div>

              <div className="col-span-8 grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">
                    Pay Amount
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    className={`w-full px-2 py-0.5 h-7 text-xs font-sans font-bold border rounded-md focus:outline-none ${
                      paymentMethod === 'KPay' ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' : 'bg-white text-slate-800 border-slate-200 focus:border-emerald-500'
                    }`}
                    value={paymentMethod === 'KPay' ? finalTotal : payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    disabled={paymentMethod === 'KPay'}
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">
                    Change Due
                  </label>
                  <div className="w-full px-2 py-0.5 h-7 flex items-center text-xs font-sans font-black text-emerald-600 bg-emerald-50 rounded-md border border-emerald-100">
                    {changeDue.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Pay Action Button */}
            <div className="pt-3 bg-white">
              <button
                disabled={cartItems.length === 0}
                onClick={handleProcessSale}
                className="w-full py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs border border-emerald-700 shadow-xs active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>🧾</span> Pay
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default SaleWorkspace;