import { BarChart3, History, Power, ShoppingCart } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

const CashierSidebar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    const activeClass =
        "flex items-center px-4 py-3 bg-[#1e2640] text-emerald-400 rounded-lg text-sm font-medium transition-all duration-200 shadow-inner";
    const inactiveClass =
        "flex items-center px-4 py-3 text-gray-400 hover:bg-[#151b30] hover:text-white rounded-lg text-sm font-medium transition-all duration-200";

    return (
        <div className="w-64 h-screen bg-[#0b0f19] text-white flex flex-col justify-between p-4 border-r border-gray-800">
            <div>
                {/* Brand Header */}
                <div className="flex items-center gap-3 px-2 py-4 border-b border-gray-800 mb-6">
                    <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center font-bold text-xl text-white">
                        M
                    </div>
                    <div>
                        <h1 className="font-bold text-base leading-tight tracking-wide">
                            MANDALAY MART
                        </h1>
                        <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mt-0.5">
                            Cashier Terminal
                        </p>
                    </div>
                </div>

                {/* Navigation links */}
                <nav className="space-y-2">
                    <NavLink
                        to="/cashier/sale"
                        className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
                    >
                        <ShoppingCart className="w-4 h-4 mr-3" />
                        Sale
                    </NavLink>
                    <NavLink
                        to="/cashier/history"
                        className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
                    >
                        <History className="w-4 h-4 mr-3" />
                        History
                    </NavLink>
                    <NavLink
                        to="/cashier/report"
                        className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
                    >
                        <BarChart3 className="w-4 h-4 mr-3" />
                        Report
                    </NavLink>
                </nav>
            </div>

            {/* Cashier Info Card & Shutdown Section */}
            <div className="space-y-3">
                <div className="bg-[#151b30] p-3 rounded-xl border border-gray-800 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                        PM
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-semibold uppercase">
                            Active Cashier
                        </p>
                        <h4 className="text-xs font-bold text-gray-200">
                            Phyo Maung (ID: 02)
                        </h4>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 bg-[#1c121f] border border-red-900/30 text-red-400 hover:bg-red-950/40 font-medium py-2.5 rounded-xl text-xs transition-all duration-200"
                >
                    <Power className="w-3.5 h-3.5" />
                    Turn Off
                </button>
            </div>
        </div>
    );
};

export default CashierSidebar;
