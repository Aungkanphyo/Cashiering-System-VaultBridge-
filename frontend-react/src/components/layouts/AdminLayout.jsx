import { Outlet, useLocation } from "react-router-dom";
import { ChevronUp, ChevronDown, Key, LogOut} from "lucide-react";
import { useEffect, useState } from "react";
import AdminSidebar from "../sidebar/AdminSidebar";

const AdminLayout = () => {
    // Show current time in the header
    const [time, setTime] = useState("");
    const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const formatted = now.toLocaleTimeString([], {hour: "2-digit", minute: "2-digit",});
            setTime(formatted);
        };

        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    // Show dynamic page title based on the current route
    const location = useLocation();
    const [pageTitle, setPageTitle] = useState("Dashboard");
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
    };

    useEffect(() => {
        const key = location.pathname.split("/").pop();
        setPageTitle(titleMap[key] || "Admin Panel");
    }, [location.pathname]);


    return (
        <div className="flex w-full h-screen overflow-hidden bg-gray-50">
            <AdminSidebar />

            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <header className="h-16 bg-white border-b border-green-400 flex items-center justify-between px-8 shadow-sm">
                    {/* Nav left side */}
                    <div className="text-gray-500 font-medium text-lg transition-all duration-300">
                        {pageTitle}
                    </div>

                    {/* Nav right side */}
                    <div className="flex items-center gap-4">
                        <div className="text-sm font-semibold text-gray-500 flex items-center gap-1.5">
                            {time}
                        </div>

                        <div className="relative">
                            <button onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}
                                className="flex items-center gap-2 bg-[#07a876] text-gray-50 px-5 py-3 text-xs font-semibold rounded-xl border border-emerald-200 shadow-sm hover:bg-[#06956a] transition"
                            >
                                Admin
                                {isAdminMenuOpen ? (<ChevronUp className="w-4 h-4" />) : (<ChevronDown className="w-4 h-4" />)}
                            </button>

                            {isAdminMenuOpen && (
                                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50">
                                    <button onClick={() => {setIsAdminMenuOpen(false); navigate("/admin/change-password");}}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition"
                                    >
                                        <Key className="w-4 h-4" /> Change Password
                                    </button>

                                    <button onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition"
                                    >
                                        <LogOut className="w-4 h-4" />Logout
                                    </button>

                                </div>
                            )}
                        </div>
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