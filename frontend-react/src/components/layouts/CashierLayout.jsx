import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import CashierSidebar from "../sidebar/CashierSidebar";

const titleMap = {
    sale: "Sale",
    history: "History",
    report: "Report",
};

const CashierLayout = () => {
    const location = useLocation();

    // Current time
    const [time, setTime] = useState("");

    // Get cashier name from localStorage (change the key if yours is different)
    const cashierName = localStorage.getItem("userName") || "Cashier";

    // Update time
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

        // Update every minute
        const interval = setInterval(updateTime, 60000);

        return () => clearInterval(interval);
    }, []);

    const key = location.pathname.split("/").pop();
    const pageTitle = titleMap[key] || "Cashier Panel";
    // Update page title when route changes
    // useEffect(() => {
    //     const key = location.pathname.split("/").pop();
    //     setPageTitle(titleMap[key] || "Cashier Panel");
    // }, [location.pathname]);

    return (
        <div className="flex w-full h-screen overflow-hidden bg-gray-50">
            {/* Sidebar */}
            <CashierSidebar />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">

                {/* Header */}
                <header className="h-16 bg-white border-b border-green-200 flex items-center justify-between px-8 shadow-sm">

                    {/* Left */}
                    <h1 className="text-lg font-semibold text-gray-700">
                        {pageTitle}
                    </h1>

                    {/* Right */}
                    <div className="flex items-center gap-4">

                        {/* Current Time */}
                        <div className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                            {time}
                        </div>

                        {/* Cashier Badge */}
                        <div className="flex items-center gap-2 bg-[#07a876] text-gray-50 px-5 py-3 text-sm font-semibold rounded-xl border border-emerald-200 shadow-sm hover:bg-[#06956a] transition">
                            {cashierName}
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