import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { session, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <div>Loading authentication state...</div>;
    }

    if (!session) {
        // Redirect to login but save the attempted location so we can redirect back after login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};
