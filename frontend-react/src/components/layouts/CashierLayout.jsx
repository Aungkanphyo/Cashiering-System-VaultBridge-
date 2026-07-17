import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import CashierSidebar from "../sidebar/CashierSidebar";
import api from "../../api/axios";

const titleMap = {
    sale: "Sale",
    history: "History",
    report: "Report",
};

const CashierLayout = () => {
    const location = useLocation();

    const [time, setTime] = useState("");
    const [cashierName, setCashierName] = useState("Cashier");

    // Update current time
    useEffect(() => {
        const updateTime = () => {
            const now = new Date();

            setTime(
                now.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                })
            );
        };

        updateTime();

        const interval = setInterval(updateTime, 60000);

        return () => clearInterval(interval);
    }, []);

    // Fetch authenticated user
    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const response = await api.get("/user");
                setCashierName(response.data.username);
            } catch (error) {
                console.error("Failed to fetch user:", error);
                setCashierName("Cashier");
            }
        };
        fetchCurrentUser();
    }, []);

    const key = location.pathname.split("/").pop();
    const pageTitle = titleMap[key] || "Cashier Panel";

    return (
        <div className="flex w-full h-screen overflow-hidden bg-gray-50">
            {/* Sidebar */}
            <CashierSidebar />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">

                {/* Header (Styled cleanly like Admin) */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm">

                    {/* Left side with brand accent bar */}
                    <div className="flex items-center gap-3">
                        <span className="w-1.5 h-6 bg-[#07a876] rounded-full" />
                        <h1 className="text-gray-800 font-semibold text-xl tracking-tight transition-all duration-300">
                            {pageTitle}
                        </h1>
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-6">

                        {/* Current Time */}
                        <div className="text-sm font-medium text-gray-500">
                            {time}
                        </div>

                        {/* Cashier Profile Badge Layout */}
                        <div className="flex items-center gap-2.5 pl-2 pr-4 py-1.5 rounded-full border border-gray-200 bg-white shadow-sm select-none">
                            {/* Uppercase first letter split */}
                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-slate-800 flex items-center justify-center font-bold text-sm">
                                {cashierName.trim().charAt(0).toUpperCase()}
                            </div>
                            
                            <span className="text-sm font-semibold text-gray-700 hidden sm:inline">
                                {cashierName}
                            </span>
                        </div>

                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default CashierLayout;