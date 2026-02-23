import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = () => {
    const { session } = useAuth();

    if (!session) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export const GuestRoute = () => {
    const { session } = useAuth();

    if (session) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};
