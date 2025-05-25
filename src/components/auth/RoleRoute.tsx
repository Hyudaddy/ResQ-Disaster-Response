import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types/auth.types';

interface RoleRouteProps {
  element: React.ReactNode;
  roles: UserRole[];
}

const RoleRoute: React.FC<RoleRouteProps> = ({ element, roles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user && roles.includes(user.role)) {
    return <>{element}</>;
  }
  
  return <Navigate to="/" replace />;
};

export default RoleRoute;