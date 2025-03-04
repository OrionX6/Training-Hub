import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import Button from './Button';
import { toast } from 'react-toastify';

const Nav = styled.nav`
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled(Link)`
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  text-decoration: none;
`;

const NavLinks = styled.div`
  display: flex;
  gap: 2rem;
  align-items: center;
`;

const NavLink = styled(Link)`
  color: #666;
  text-decoration: none;
  &:hover {
    color: #333;
  }
`;

const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const LoadingText = styled.div`
  font-size: 1.2rem;
  color: var(--primary-color);
`;

const Navigation: React.FC = () => {
  const {
    user,
    userData,
    isAdmin,
    isSuperAdmin,
    signOut,
    refreshAuthState,
    loading: authLoading,
    connectionError,
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);

  // Update authentication state and handle transitions
  useEffect(() => {
    const checkAuthState = () => {
      const authenticated = !!user && !!userData;

      // Only update if the authenticated state has changed
      if (authenticated !== isAuthenticated) {
        console.log('Navigation: Auth state updated:', {
          authenticated,
          hasUser: !!user,
          hasUserData: !!userData,
          role: userData?.role,
        });
        setIsAuthenticated(authenticated);
      }
    };

    // Skip state updates during loading
    if (!authLoading) {
      checkAuthState();
    }
  }, [user, userData, authLoading, isAuthenticated]);

  // Handle navigation and auth state mismatches
  useEffect(() => {
    const checkAuth = async () => {
      if (loading || authLoading) {
        return;
      }

      // If we have a user but no user data, or if there's a state mismatch
      if ((user && !userData) || isAuthenticated !== !!(user && userData)) {
        console.log('Navigation: Auth state mismatch detected, refreshing state');
        await refreshAuthState(true);
      }
    };

    // Only check auth if there's no connection error
    if (!connectionError) {
      checkAuth();
    }
  }, [location, user, userData, loading, authLoading, isAuthenticated, refreshAuthState, connectionError]);

  const handleSignOut = useCallback(async () => {
    try {
      setLoading(true); // Prevent any state updates during sign out
      console.log('Navigation: Signing out');

      // First clear auth state
      setIsAuthenticated(false);

      // Then perform sign out
      await signOut();

      // Force navigation to home page after sign out
      navigate('/', { replace: true });

      // Force a refresh of the auth state to ensure UI is updated
      await new Promise(resolve => setTimeout(resolve, 500));
      await refreshAuthState(true);
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Error signing out. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [signOut, navigate, refreshAuthState]);

  // Render the navigation
  const renderNav = () => (
    <Nav data-testid="navigation">
      <Container>
        <Logo to="/">Training Hub</Logo>
        <NavLinks>
          <NavLink to="/study-guides">Study Guides</NavLink>
          
          {/* Only show Admin link if authenticated and has admin role */}
          {isAuthenticated && (isAdmin || isSuperAdmin) && (
            <NavLink to="/admin">Admin</NavLink>
          )}
          
          {/* Show Sign In/Out button based on authentication state */}
          {isAuthenticated ? (
            <Button onClick={handleSignOut} disabled={loading || connectionError}>
              {loading ? 'Signing out...' : 'Sign Out'}
            </Button>
          ) : (
            <Button 
              onClick={() => navigate('/login')} 
              disabled={loading}
              variant={connectionError ? 'secondary' : 'primary'}
            >
              {loading ? 'Loading...' : connectionError ? 'Connection Error' : 'Sign In'}
            </Button>
          )}
        </NavLinks>
      </Container>
    </Nav>
  );

  // Return loading overlay or navigation
  return (
    <>
      {renderNav()}
      {loading && (
        <LoadingOverlay>
          <LoadingText>{loading ? 'Signing out...' : 'Loading...'}</LoadingText>
        </LoadingOverlay>
      )}
    </>
  );
};

export default React.memo(Navigation);
