import { BarChart3, History, LogOut, ShoppingCart, ShoppingBasket } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import api from "../../api/axios";
import { useState } from "react";

const CashierSidebar = () => {
    const navigate = useNavigate();
    const logoutUser = useAuthStore((state) => state.logout);

    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    const handleLogout = async() => {
        setIsConfirmOpen(false);
        try {
            await api.post("/logout");
        } catch (error) {
            console.error("Backend logout failed:", error);
        } finally {
            logoutUser();
            navigate("/login");
        }
    };

    const activeClass =
        "flex items-center px-4 py-3 bg-[#07a876] text-white rounded-xl text-sm font-medium shadow-md transition-all";

    const inactiveClass =
        "flex items-center px-4 py-3 text-gray-50 hover:bg-white/10 hover:text-white rounded-xl text-sm font-medium transition-all";

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
                        <p className="text-xs text-white/80 uppercase tracking-widest">Cashier Dashboard</p>
                    </div>
                </div>

                {/* Navigation Line */}
                <div className="border-b border-white/10 mb-4" />

                {/* Navigation Items*/}
                <nav className="space-y-4">
                    {/* Sale Section*/}
                    <NavLink to="/cashier/sale" className={({ isActive }) => isActive ? activeClass : inactiveClass}>
                        <ShoppingCart className="w-4 h-4 mr-4" /> Sale
                    </NavLink>

                    {/* History Section*/}
                    <NavLink to="/cashier/history" className={({ isActive }) => isActive ? activeClass : inactiveClass}>
                        <History className="w-4 h-4 mr-4" /> History
                    </NavLink>

                    {/* Report Section*/}
                    <NavLink to="/cashier/report" className={({ isActive }) => isActive ? activeClass : inactiveClass}>
                        <BarChart3 className="w-4 h-4 mr-4" /> Report
                    </NavLink>
                </nav>
            </div>

            {/* Bottom Section */}
            {/* <div className="space-y-3"> */}
                {/* LOGOUT */}
                {/* <button onClick={() => setIsConfirmOpen(true)} */}
                    {/* // className="w-full flex items-center justify-center gap-2 bg-red-700 hover:bg-red-600 text-white font-medium py-2.5 rounded-xl text-sm transition-all" */}
                {/* > */}
                    {/* <LogOut className="w-3.5 h-3.5" /> Logout */}
                {/* </button> */}
            {/* </div> */}

            {/* Logout Confirmation Modal Popup */}
            {isConfirmOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center transform transition-all scale-100">
                        <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
                            <LogOut className="w-6 h-6" />
                        </div>

                        <h3 className="text-gray-900 text-lg font-bold mb-2">Are you sure you want to log out?</h3>
                        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                            Logging out will stop current operations.
                        </p>

                        <div className="flex gap-3 justify-center">
                            {/* Cancel Button */}
                            <button onClick={() => setIsConfirmOpen(false)}
                                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition">
                                Cancel
                            </button>
                            {/* Confirm Button */}
                            <button onClick={handleLogout}
                                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl shadow-sm shadow-red-200 transition">
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default CashierSidebar;