import { BarChart3, History, Power, ShoppingCart, ShoppingBasket } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
 
const CashierSidebar = () => {
    const navigate = useNavigate();
 
    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };
 
    const activeClass =
        "flex items-center px-4 py-3 bg-[#07a876] text-white rounded-xl text-sm font-medium shadow-md transition-all";
 
    const inactiveClass =
        "flex items-center px-4 py-3 text-gray-300 hover:bg-white/10 hover:text-white rounded-xl text-sm font-medium transition-all";
 
    return (
        <div className="w-64 h-screen bg-[#0c8761] text-white flex flex-col justify-between p-4">
 
            {/* TOP SECTION */}
            <div>
 
                {/* BRAND */}
                <div className="flex items-center gap-3 px-2 pt-4 pb-2 mb-6">
                    <div className="w-11 h-11 bg-white text-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                        <ShoppingBasket className="w-6 h-6" />
                    </div>
 
                    <div>
                        <h1 className="font-bold text-base tracking-wide">
                            MART4U POS
                        </h1>
                        <p className="text-xs text-white/70 uppercase tracking-widest">
                            Cashier Dashboard
                        </p>
                    </div>
                </div>
 
                <div className="border-b border-white/10 mb-4" />
 
                {/* NAVIGATION */}
                <nav className="space-y-2">
                    <NavLink
                        to="/cashier/sale"
                        className={({ isActive }) =>
                            isActive ? activeClass : inactiveClass
                        }
                    >
                        <ShoppingCart className="w-4 h-4 mr-3" />
                        Sale
                    </NavLink>
 
                    <NavLink
                        to="/cashier/history"
                        className={({ isActive }) =>
                            isActive ? activeClass : inactiveClass
                        }
                    >
                        <History className="w-4 h-4 mr-3" />
                        History
                    </NavLink>
 
                    <NavLink
                        to="/cashier/report"
                        className={({ isActive }) =>
                            isActive ? activeClass : inactiveClass
                        }
                    >
                        <BarChart3 className="w-4 h-4 mr-3" />
                        Report
                    </NavLink>
                </nav>
            </div>
 
            {/* BOTTOM SECTION */}
            <div className="space-y-3">
 
                {/* USER CARD */}
                <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-white text-emerald-600 flex items-center justify-center font-bold text-sm">
                        PM
                    </div>
 
                    <div>
                        <p className="text-xs text-white/60 uppercase">
                            Active Cashier
                        </p>
                        <h4 className="text-xs font-semibold text-white">
                            Phyo Maung (ID: 02)
                        </h4>
                    </div>
                </div>
 
                {/* LOGOUT */}
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 bg-red-700 hover:bg-red-600 text-white font-medium py-2.5 rounded-xl text-xs transition-all"
                >
                    <Power className="w-3.5 h-3.5" />
                    Logout
                </button>
            </div>
        </div>
    );
};
 
export default CashierSidebar;