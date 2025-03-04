import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ChangePassword from './ChangePassword';

interface PasswordChangeGuardProps {
  children: React.ReactNode;
}

const PasswordChangeGuard: React.FC<PasswordChangeGuardProps> = ({ children }) => {
  const { user, passwordChangeRequired } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (passwordChangeRequired) {
    // Don't show password change screen if we're already on the change password route
    if (location.pathname === '/change-password') {
      return <>{children}</>;
    }
    return <ChangePassword />;
  }

  return <>{children}</>;
};

export default PasswordChangeGuard;
