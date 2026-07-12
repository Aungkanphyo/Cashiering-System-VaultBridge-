import { useAuthStore } from '../stores/authStore';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
    const { isAuthenticated, user } = useAuthStore();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // logged in but your role does not match, you will be redirected to a 404 or appropriate page
    if (allowedRoles && !allowedRoles.includes(user?.role)) {
        return (
            <div className="flex flex-col items-center justify-center h-screen font-sans bg-gray-50 text-center p-6">
                <h1 className="text-6xl font-extrabold text-red-500 mb-4">403</h1>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
                <p className="text-gray-600 mb-6">You do not have permission to access this page.</p>
                <button
                    onClick={() => window.location.href = user?.role === 'admin' ? '/admin/dashboard' : '/cashier/sale'}
                    className="px-5 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl shadow-md hover:bg-emerald-700 transition"
                >
                    Return to homepage
                </button>
            </div>
        );
    }

    return <Outlet />;
}

export default ProtectedRoute
