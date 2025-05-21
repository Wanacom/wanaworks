import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  // Show loading indicator while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access if required
  if (requiredRole && user && !hasRequiredRole(user.role, requiredRole)) {
    return <Navigate to="/" replace />;
  }

  // User is authenticated and has required role (if specified)
  return <>{children}</>;
};

// Helper function to check if user has required role
const hasRequiredRole = (userRole: string, requiredRole: string): boolean => {
  const roleHierarchy: Record<string, number> = {
    'Admin': 5,
    'Manager': 4,
    'Planner': 3,
    'Sales': 2,
    'Tech': 1
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};

export default ProtectedRoute;