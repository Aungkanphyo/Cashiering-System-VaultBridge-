import { ChevronDown, ChevronUp, CreditCard, DollarSign, History, Layers, LayoutDashboard, ShoppingBag, Users, ShoppingBasket, ClipboardList } from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";

const AdminSidebar = () => {
    // Dropdown states
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [isProductOpen, setIsProductOpen] = useState(false);
    const [isStaffOpen, setIsStaffOpen] = useState(false);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [isAuditsOpen, setIsAuditsOpen] = useState(false);

    const activeClass = "flex items-center px-4 py-3 bg-[#07a876] text-white rounded-xl text-sm font-medium shadow-md transition-all";
    const inactiveClass = "flex items-center px-4 py-3 text-gray-50 hover:bg-white/10 hover:text-white rounded-xl text-sm font-medium transition-all";

    return (
        <div className="w-64 h-screen bg-[#08694b] text-white flex flex-col justify-between p-4">
            {/* Top Section */}
            <div>
                {/* Brand */}
                <div className="flex items-center gap-3 px-2 pt-4 pb-2 mb-6">
                    <div className="w-11 h-11 bg-white text-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                        <ShoppingBasket className="w-6 h-6" />
                    </div>

                    <div>
                        <h1 className="font-bold text-base tracking-wide">MART4U </h1>
                        <p className="text-xs text-white/70 uppercase tracking-widest">Admin Dashboard</p>
                    </div>
                </div>

                {/* Navigation Line */}
                <div className="border-b border-white/10 mb-4" />

                {/* Navigation Items */}
                <nav className="space-y-3 overflow-y-auto max-h-[calc(100vh-180px)] pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] scrollbar-none">
                    {/* Dashboard Section*/}
                    <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? activeClass : inactiveClass}>
                        <LayoutDashboard className="w-4 h-4 mr-3" /> Dashboard
                    </NavLink>

                    {/* Category Section Dropdown*/}
                    <div>
                        <button onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                            className="w-full flex items-center justify-between px-4 py-3 text-xs font-bold text-gray-50 uppercase tracking-wider hover:bg-white/5 rounded-xl transition-all"
                        >
                            <div className="flex items-center gap-2">
                                <Layers className="w-4 h-4" />
                                <span>Category</span>
                            </div>
                            {isCategoryOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>

                        {/* Category Items Open Section */}
                        {isCategoryOpen && (
                            <div className="pl-2 mt-1 space-y-1">
                                {/* View Category */}
                                <NavLink to="/admin/view-category" className={({ isActive }) => isActive ? activeClass : inactiveClass}>
                                    <Layers className="w-4 h-4 mr-3" /> View Category
                                </NavLink>


                            </div>
                        )}
                    </div>

                    {/* Product Section Dropdown */}
                    <div>
                        <button onClick={() => setIsProductOpen(!isProductOpen)}
                            className="w-full flex items-center justify-between px-4 py-3 text-xs font-bold text-gray-50 uppercase tracking-wider hover:bg-white/5 rounded-xl transition-all"
                        >
                            <div className="flex items-center gap-2">
                                <ShoppingBag className="w-4 h-4 mr-2" />
                                <span>Product</span>
                            </div>
                            {isProductOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>

                        {/* Product Items Open Section */}
                        {isProductOpen && (
                            <div className="pl-2 mt-1 space-y-1">
                                {/* View Product */}
                                <NavLink to="/admin/view-product" className={({ isActive }) => isActive ? activeClass : inactiveClass}>
                                    <ShoppingBag className="w-4 h-4 mr-3" />View Product
                                </NavLink>


                            </div>
                        )}
                    </div>

                    {/* Staff Section Dropdown */}
                    <div>
                        <button onClick={() => setIsStaffOpen(!isStaffOpen)}
                            className="w-full flex items-center justify-between px-4 py-3 text-xs font-bold text-gray-50 uppercase tracking-wider hover:bg-white/5 rounded-xl transition-all"
                        >
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 mr-2" />
                                <span>Staff</span>
                            </div>
                            {isStaffOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>

                        {/* Staff Items Open Section */}
                        {isStaffOpen && (
                            <div className="pl-2 mt-1 space-y-1">
                                {/* View Staff */}
                                <NavLink to="/admin/view-staff" className={({ isActive }) => isActive ? activeClass : inactiveClass}>
                                    <Users className="w-4 h-4 mr-3" /> View Staff
                                </NavLink>

                                {/* Add Staff */}
                                {/* <NavLink to="/admin/add-staff" className={({ isActive }) => isActive ? activeClass : inactiveClass}>
                                    <PlusCircle className="w-4 h-4 mr-3" /> Add Staff
                                </NavLink> */}
                            </div>
                        )}
                    </div>

                    {/* Payment Section Dropdown */}
                    <div>
                        <button onClick={() => setIsPaymentOpen(!isPaymentOpen)}
                            className="w-full flex items-center justify-between px-4 py-3 text-xs font-bold text-gray-50 uppercase tracking-wider hover:bg-white/5 rounded-xl transition-all"
                        >
                            <div className="flex items-center gap-2">
                                <CreditCard className="w-4 h-4 mr-2" />
                                <span>Payment</span>
                            </div>
                            {isPaymentOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>

                        {/* Payment Items Open Section */}
                        {isPaymentOpen && (
                            <div className="pl-2 mt-1 space-y-1">
                                {/* View Payment */}
                                <NavLink to="/admin/view-payment" className={({ isActive }) => isActive ? activeClass : inactiveClass}>
                                    <CreditCard className="w-4 h-4 mr-3" /> View Payment
                                </NavLink>


                            </div>
                        )}
                    </div>

                    {/* Audits Section Dropdown*/}
                    <div>
                        <button onClick={() => setIsAuditsOpen(!isAuditsOpen)}
                            className="w-full flex items-center justify-between px-4 py-3 text-xs font-bold text-gray-50 uppercase tracking-wider hover:bg-white/5 rounded-xl transition-all"
                        >
                            <div className="flex items-center gap-2">
                                <ClipboardList className="w-4 h-4 mr-2" />
                                <span>Audits</span>
                            </div>
                            {isAuditsOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>

                        {/* Audits Items Open Section */}
                        {isAuditsOpen && (
                            <div className="pl-2 mt-1 space-y-1">
                                {/* View Audits */}
                                <NavLink to="/admin/view-session" className={({ isActive }) => isActive ? activeClass : inactiveClass}>
                                    <History className="w-4 h-4 mr-3" /> Register Sessions
                                </NavLink>

                                {/* Sales & Payments */}
                                <NavLink to="/admin/view-history" className={({ isActive }) => isActive ? activeClass : inactiveClass}>
                                    <DollarSign className="w-4 h-4 mr-3" /> Sales History
                                </NavLink>
                            </div>
                        )}

                    </div>
                </nav>
            </div>
        </div>
    )
}

export default AdminSidebar;
