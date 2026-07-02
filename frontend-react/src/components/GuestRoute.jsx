import { useAuthStore } from '../stores/authStore';
import { Navigate, Outlet } from 'react-router-dom';

const GuestRoute = () => {
    const { isAuthenticated, user } = useAuthStore();

    if (isAuthenticated) {
        // Will be redirected to his Dashboard according to his role
        return user?.role === "admin" 
        ? <Navigate to="/admin/dashboard" replace /> 
        : <Navigate to="/cashier/sale" replace />;
    }

    return <Outlet/>
}

export default GuestRoute
