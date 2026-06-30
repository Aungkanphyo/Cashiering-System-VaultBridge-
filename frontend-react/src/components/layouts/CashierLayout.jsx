import { Outlet } from "react-router-dom";
import CashierSidebar from "../sidebar/CashierSidebar";

const CashierLayout = () => {
    return (
        <div className="flex w-full h-screen overflow-hidden bg-gray-50">
            <CashierSidebar />
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <main className="flex-1 overflow-y-auto bg-gray-100">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default CashierLayout
