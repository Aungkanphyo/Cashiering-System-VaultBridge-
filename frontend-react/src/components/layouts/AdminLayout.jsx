import { Outlet } from "react-router-dom";
import AdminSidebar from "../sidebar/AdminSidebar";

const AdminLayout = () => {
    return (
        <div className="flex w-full h-screen overflow-hidden bg-gray-50">
            {/* Sidebar Core Component */}
            <AdminSidebar />

            {/* Main Framework Content Dynamic Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Dynamic Top Navbar Wrapper */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm">
                    <div className="text-gray-400 font-medium text-sm">Dashboard Framework Context</div>
                    <div className="flex items-center gap-4">
                        <span className="bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-semibold rounded-full border border-emerald-200">
                            ● SYSTEM ONLINE (MVP text-v1.3)
                        </span>
                        <div className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                            Admin (Aung Aung)
                        </div>
                    </div>
                </header>

                {/* Dynamic Render Component Body */}
                <main className="flex-1 overflow-y-auto p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default AdminLayout
