import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

export interface ProtectedRouteProps {
  children: React.ReactElement;
  allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles = [] }) => {
  const { userData, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!userData) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(userData.role)) {
    return <Navigate to="/study-guides" replace />;
  }

  return children;
};

export default ProtectedRoute;
