import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { ChevronUp, ChevronDown, Key, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import AdminSidebar from "../sidebar/AdminSidebar";
import { useAuthStore } from "../../stores/authStore";
import api from "../../api/axios";
// import ChangePassword from "../../pages/admin/change_password";
const AdminLayout = () => {
    // Show current time in the header
    const [time, setTime] = useState("");
    const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
    const navigate = useNavigate();
    const logoutUser = useAuthStore((state) => state.logout);

    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    const handleLogout = async () => {
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

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const formatted = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", });
            setTime(formatted);
        };

        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    // Show dynamic page title based on the current route
    const location = useLocation();
    const titleMap = {
        "dashboard": "Dashboard",
        "view-category": "View Category",
        "add-category": "Add Category",
        "view-product": "View Product",
        "add-product": "Add Product",
        "view-staff": "View Staff",
        "add-staff": "Add Staff",
        "view-payment": "View Payment",
        "add-payment": "Add Payment",
        "view-session": "View Sessions",
        "view-history": "View History",
        "change-password": "Change Password",
    };

    const key = location.pathname.split("/").pop();
    const pageTitle = titleMap[key] || "Admin Panel";

    // useEffect(() => {
    //     const key = location.pathname.split("/").pop();
    //     setPageTitle(titleMap[key] || "Admin Panel");
    // }, [location.pathname]);


    return (
        <div className="flex w-full h-screen overflow-hidden bg-gray-50">
            <AdminSidebar />

            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <header className="h-16 bg-white border-b border-green-400 flex items-center justify-between px-8 shadow-sm">
                    {/* Nav left side */}
                    <div className="text-gray-700 font-medium text-lg transition-all duration-300">
                        {pageTitle}
                    </div>

                    {/* Nav right side */}
                    <div className="flex items-center gap-4">
                        <div className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                            {time}
                        </div>

                        <div className="relative">
                            <button onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}
                                className="flex items-center gap-2 bg-[#07a876] text-gray-50 px-5 py-3 text-sm font-semibold rounded-xl border border-emerald-200 shadow-sm hover:bg-[#06956a] transition"
                            >
                                Admin
                                {isAdminMenuOpen ? (<ChevronUp className="w-4 h-4" />) : (<ChevronDown className="w-4 h-4" />)}
                            </button>

                            {isAdminMenuOpen && (
                                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50">
                                    <button onClick={() => { setIsAdminMenuOpen(false); navigate("/admin/change-password"); }}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-[#21bf8f] hover:text-white transition"
                                    >
                                        <Key className="w-4 h-4" /> Change Password
                                    </button>

                                    <button onClick={() => {setIsAdminMenuOpen(false); setIsConfirmOpen(true);}}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-[#21bf8f] hover:text-white transition"
                                    >
                                        <LogOut className="w-4 h-4" />Logout
                                    </button>

                                </div>
                            )}
                        </div>

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
                                        <button
                                            onClick={() => setIsConfirmOpen(false)}
                                            className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition"
                                        >
                                            Cancel
                                        </button>
                                        {/* Confirm Button */}
                                        <button
                                            onClick={handleLogout}
                                            className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl shadow-sm shadow-red-200 transition"
                                        >
                                            Confirm
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-y-auto p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;