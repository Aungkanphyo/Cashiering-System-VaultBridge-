import { ChevronDown, ChevronUp, CreditCard, DollarSign, History, Layers, LayoutDashboard, LogOut, PlusCircle, ShoppingBag, Users } from "lucide-react";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

const AdminSidebar = () => {
    const navigate = useNavigate();

    // Dropdown states
    const [isCategoryOpen, setIsCategoryOpen] = useState(true);
    const [isProductOpen, setIsProductOpen] = useState(false);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const activeClass = "flex items-center px-4 py-2.5 bg-[#1e2640] text-emerald-400 rounded-lg text-sm font-medium transition-all duration-200";
    const inactiveClass = "flex items-center px-4 py-2.5 text-gray-400 hover:bg-[#151b30] hover:text-white rounded-lg text-sm font-medium transition-all duration-200";

    return (
        <div className="w-64 h-screen bg-[#0b0f19] text-white flex flex-col justify-between p-4 font-sans border-r border-gray-800">
            <div>
                {/* Brand Header */}
                <div className="flex items-center gap-3 px-2 py-4 border-b border-gray-800 mb-6">
                    <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center font-bold text-xl text-white">M</div>
                    <div>
                        <h1 className="font-bold text-base leading-tight tracking-wide">MANDALAY MART</h1>
                        <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mt-0.5">Admin Control Panel</p>
                    </div>
                </div>

                {/* Navigation Items */}
                <nav className="space-y-1.5 overflow-y-auto max-h-[calc(100vh-180px)] pr-1">
                    {/* Dashboard */}
                    <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? activeClass : inactiveClass}>
                        <LayoutDashboard className="w-4 h-4 mr-3" />
                        Dashboard
                    </NavLink>

                    {/* Category Settings Dropdown */}
                    <div>
                        <button
                            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                            className="w-full flex items-center justify-between px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider hover:text-gray-300 mt-4 mb-1"
                        >
                            <span>Category Settings</span>
                            {isCategoryOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>

                        {isCategoryOpen && (
                            <div className="pl-2 space-y-1">
                                <NavLink to="/admin/categories-view" className={({ isActive }) => isActive ? activeClass : inactiveClass}>
                                    <Layers className="w-4 h-4 mr-3" />
                                    Categories View
                                </NavLink>
                                <NavLink to="/admin/add-category" className={({ isActive }) => isActive ? activeClass : inactiveClass}>
                                    <PlusCircle className="w-4 h-4 mr-3" />
                                    Add Category
                                </NavLink>
                            </div>
                        )}
                    </div>

                    {/* Product Settings Dropdown */}
                    <div>
                        <button
                            onClick={() => setIsProductOpen(!isProductOpen)}
                            className="w-full flex items-center justify-between px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider hover:text-gray-300 mt-4 mb-1"
                        >
                            <span>Product Settings</span>
                            {isProductOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>

                        {isProductOpen && (
                            <div className="pl-2 space-y-1">
                                <NavLink to="/admin/products-view" className={({ isActive }) => isActive ? activeClass : inactiveClass}>
                                    <ShoppingBag className="w-4 h-4 mr-3" />
                                    Products View
                                </NavLink>
                                <NavLink to="/admin/add-product" className={({ isActive }) => isActive ? activeClass : inactiveClass}>
                                    <PlusCircle className="w-4 h-4 mr-3" />
                                    Add Product
                                </NavLink>
                            </div>
                        )}
                    </div>

                    {/* Staff & Security */}
                    <div className="pt-2">
                        <span className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Staff & Security</span>
                        <NavLink to="/admin/users-cashiers" className={({ isActive }) => isActive ? activeClass : inactiveClass}>
                            <Users className="w-4 h-4 mr-3" />
                            User & Cashiers
                        </NavLink>
                    </div>

                    {/* System Settings */}
                    <div className="pt-2">
                        <span className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">System Settings</span>
                        <NavLink to="/admin/payment-methods" className={({ isActive }) => isActive ? activeClass : inactiveClass}>
                            <CreditCard className="w-4 h-4 mr-3" />
                            Payment Methods
                        </NavLink>
                    </div>

                    {/* Audits */}
                    <div className="pt-2">
                        <span className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Audits</span>
                        <NavLink to="/admin/register-sessions" className={({ isActive }) => isActive ? activeClass : inactiveClass}>
                            <History className="w-4 h-4 mr-3" />
                            Register Sessions
                        </NavLink>
                        <NavLink to="/admin/sales-split-payments" className={({ isActive }) => isActive ? activeClass : inactiveClass}>
                            <DollarSign className="w-4 h-4 mr-3" />
                            Sales & Payments
                        </NavLink>
                    </div>
                </nav>
            </div>

            {/* Logout Button */}
            <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-medium py-2.5 rounded-xl text-sm transition-all duration-200 mt-auto shadow-md shadow-rose-900/20"
            >
                <LogOut className="w-4 h-4" />
                LOGOUT
            </button>
        </div>
    )
}

export default AdminSidebar
