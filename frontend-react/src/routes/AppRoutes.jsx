import { Navigate, Route, Routes } from "react-router-dom";
import Login from "../pages/auth/Login";
import AdminLayout from "../components/layouts/AdminLayout";
import Dashboard from "../pages/admin/Dashboard";
import ViewCategory from "../pages/admin/category/ViewCategory";
import EditCategory from "../pages/admin/category/EditCategory";
import ViewProduct from "../pages/admin/product/ViewProduct";
import EditProduct from "../pages/admin/product/EditProduct";
import ViewStaff from "../pages/admin/staff/ViewStaff";
import ViewPayment from "../pages/admin/payment/ViewPayment";
import EditPayment from "../pages/admin/payment/EditPayment";
import ViewSession from "../pages/admin/audits/ViewSession";
import ViewHistory from "../pages/admin/audits/ViewHistory";
import CashierLayout from "../components/layouts/CashierLayout";
import SaleWorkspace from "../pages/cashier/SaleWorkspace";
import Report from "../pages/cashier/Report";
import History from "../pages/cashier/History";
import ProtectedRoute from "../components/ProtectedRoute";
import GuestRoute from "../components/GuestRoute";
import ChangePassword from "../pages/admin/ChangePassword";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";
import AddStaffModal from "../pages/admin/staff/Popup/AddStaffModal";
import EditStaffModal from "../pages/admin/staff/Popup/EditStaffModal";
import StaffDetailModal from "../pages/admin/staff/Popup/StaffDetailModal";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Default Route redirection to Login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Public Route */}
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword/>} />
        <Route path="/reset-password" element={<ResetPassword/>} />
      </Route>

      {/* Admin Panel Routes (Nested Routes) */}
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />

          <Route path="view-category" element={<ViewCategory />} />
          <Route path="edit-category/:id" element={<EditCategory />} />

          <Route path="view-product" element={<ViewProduct />} />
          <Route path="edit-product/:id" element={<EditProduct />} />

          <Route path="view-staff" element={<ViewStaff />} />
          <Route path="add-staff" element={<AddStaffModal />} />
            <Route path="edit-staff" element={<EditStaffModal />} />
            <Route path="detail-staff" element={<StaffDetailModal />} />

          <Route path="view-payment" element={<ViewPayment />} />
          <Route path="edit-payment/:id" element={<EditPayment />} />

          <Route path="view-session" element={<ViewSession />} />
          <Route path="view-history" element={<ViewHistory />} />
          <Route path="change-password" element={<ChangePassword />} />
        </Route>
      </Route>

      {/* Cashier Terminal Routes */}
      <Route element={<ProtectedRoute allowedRoles={["cashier"]} />}>
        <Route path="/cashier" element={<CashierLayout />}>
          <Route index element={<Navigate to="sale" replace />} />
          <Route path="sale" element={<SaleWorkspace />} />
          <Route path="history" element={<History />} />
          <Route path="report" element={<Report />} />
        </Route>
      </Route>

      {/* 404 Catch All Route */}
      <Route
        path="*"
        element={
          <div className="flex items-center justify-center h-screen font-bold text-red-500">
            404 - Page Not Found
          </div>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
