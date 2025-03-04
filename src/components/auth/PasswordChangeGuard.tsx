import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ChangePassword from './ChangePassword';
import styled from 'styled-components';

interface PasswordChangeGuardProps {
  children: React.ReactNode;
}

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 1.2rem;
  color: var(--text-secondary);
`;

const PasswordChangeGuard: React.FC<PasswordChangeGuardProps> = ({ children }) => {
  const { user, userData, passwordChangeRequired, loading, refreshAuthState } = useAuth();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  // Refresh auth state when component mounts or location changes
  useEffect(() => {
    const checkAuth = async () => {
      setIsChecking(true);

      if (!user && !loading) {
        await refreshAuthState();
      }

      setIsChecking(false);
    };

    checkAuth();
  }, [location, user, loading, refreshAuthState]);

  // Show loading state while checking
  if (loading || isChecking) {
    return <LoadingContainer>Loading...</LoadingContainer>;
  }

  // Redirect to login if not authenticated
  if (!user || !userData) {
    console.log('Password change guard: No user data, redirecting to login');
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Handle password change requirement
  if (passwordChangeRequired) {
    // Don't show password change screen if we're already on the change password route
    if (location.pathname === '/change-password') {
      return <>{children}</>;
    }
    console.log('Password change guard: Password change required, redirecting');
    return <ChangePassword />;
  }

  // User is authenticated and no password change required
  return <>{children}</>;
};

export default PasswordChangeGuard;
