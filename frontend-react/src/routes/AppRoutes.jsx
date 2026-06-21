import { Navigate, Route, Routes } from "react-router-dom";
import Login from "../pages/auth/Login";
import AdminLayout from "../components/layouts/AdminLayout";
import Dashboard from "../pages/admin/Dashboard";
import CategoriesView from "../pages/admin/CategoriesView";
import AddCategory from "../pages/admin/AddCategory";
import ProductsView from "../pages/admin/ProductsView";
import AddProduct from "../pages/admin/AddProduct";
import UserCashiers from "../pages/admin/UserCashiers";
import PaymentMethods from "../pages/admin/PaymentMethods";
import RegisterSessions from "../pages/admin/RegisterSessions";
import SalesAndPayments from "../pages/admin/SalesAndPayments";
import CashierLayout from "../components/layouts/CashierLayout";
import SaleWorkspace from "../pages/cashier/SaleWorkspace";
import Report from "../pages/cashier/Report";
import History from "../pages/cashier/History";

const AppRoutes = () => {
  return (
    <Routes>
        {/* Default Route redirection to Login */}
        <Route path="/" element={<Navigate to="/login" replace/>} />

        {/* Public Route */}
        <Route path="/login" element={<Login />} />

        {/* Admin Panel Routes (Nested Routes) */}
        <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="categories-view" element={<CategoriesView />} />
            <Route path="add-category" element={<AddCategory />} />
            <Route path="products-view" element={<ProductsView />} />
            <Route path="add-product" element={<AddProduct />} />
            <Route path="users-cashiers" element={<UserCashiers />} />
            <Route path="payment-methods" element={<PaymentMethods />} />
            <Route path="register-sessions" element={<RegisterSessions />} />
            <Route path="sales-split-payments" element={<SalesAndPayments />} />
        </Route>

        {/* Cashier Terminal Routes */}
        <Route path="/cashier" element={<CashierLayout />}>
            <Route index element={<Navigate to="sale" replace />} />
            <Route path="sale" element={<SaleWorkspace />} />
            <Route path="history" element={<History />} />
            <Route path="report" element={<Report />} />
        </Route>

        {/* 404 Catch All Route */}
        <Route path="*" element={<div className="flex items-center justify-center h-screen font-bold text-red-500">404 - Page Not Found</div>} />
    </Routes>
  )
}

export default AppRoutes
