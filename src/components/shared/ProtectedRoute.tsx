import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styled from 'styled-components';
import { UserRole } from '../../types';
import { toast } from 'react-toastify';

interface Props {
  children: React.ReactNode;
  adminOnly?: boolean;
  superAdminOnly?: boolean;
  allowedRoles?: UserRole[];
  publicFallback?: React.ReactNode;
}

const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 1.2rem;
  color: var(--primary-color);
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  margin-right: 1rem;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const ErrorWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 1.2rem;
  color: var(--error-color);
  text-align: center;
  padding: 0 2rem;
`;

const ProtectedRoute: React.FC<Props> = ({
  children,
  adminOnly = false,
  superAdminOnly = false,
  allowedRoles = [],
  publicFallback = null,
}) => {
  const { user, userData, isAdmin, isSuperAdmin, loading, connectionError, dbError } = useAuth();
  const location = useLocation();
  const [showLoading, setShowLoading] = useState(loading);
  const [authCheckComplete, setAuthCheckComplete] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log('ProtectedRoute auth state:', {
      user: user?.id,
      userData: userData?.role,
      isAdmin,
      isSuperAdmin,
      loading,
      authCheckComplete,
      superAdminOnly,
      adminOnly,
      allowedRoles,
      pathname: location.pathname
    });
  }, [user, userData, isAdmin, isSuperAdmin, loading, authCheckComplete, superAdminOnly, adminOnly, allowedRoles, location]);
  
  // Handle loading state with a short delay to prevent flicker
  useEffect(() => {
    if (loading) {
      setShowLoading(true);
    } else {
      const timer = setTimeout(() => {
        setShowLoading(false);
        setAuthCheckComplete(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [loading]);
  
  // Show loading state during initial auth check
  if (showLoading && !authCheckComplete) {
    return (
      <LoadingWrapper>
        <LoadingSpinner />
        Checking authorization...
      </LoadingWrapper>
    );
  }

  // For public fallback routes, show the fallback if there's a connection error
  if ((connectionError || dbError) && publicFallback) {
    console.log('Connection error with public fallback, showing fallback');
    return <>{publicFallback}</>;
  }

  // For non-public routes, redirect to login if there's a connection error
  if (connectionError && !publicFallback) {
    console.log('Connection error without public fallback, redirecting to login');
    toast.error('Unable to verify authentication. Please log in again.');
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // If not authenticated and no public fallback, redirect to login
  if (!user && !publicFallback) {
    console.log('Not authenticated without public fallback, redirecting to login');
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // If not authenticated but we have a public fallback, show that
  if (!user && publicFallback) {
    console.log('Not authenticated with public fallback, showing fallback');
    return <>{publicFallback}</>;
  }

  // For admin routes, only check if user is authenticated
  if (superAdminOnly || adminOnly) {
    return <>{children}</>;
  }

  // Admin check
  if (adminOnly && !isAdmin) {
    console.log('Admin access required but user is not admin');
    toast.error('Administrator access required');
    return <Navigate to="/study-guides" replace />;
  }

  // Role check
  if (allowedRoles.length > 0 && userData && !allowedRoles.includes(userData.role)) {
    console.log('User does not have required role');
    if (publicFallback) {
      return <>{publicFallback}</>;
    }
    toast.error('Access denied');
    return <Navigate to="/study-guides" replace />;
  }

  // All checks passed, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
