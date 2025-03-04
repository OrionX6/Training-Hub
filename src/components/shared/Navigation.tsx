import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import Button from './Button';

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

const Navigation: React.FC = () => {
  const { user, isAdmin, isSuperAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <Nav data-testid="navigation">
      <Container>
        <Logo to="/">Training Hub</Logo>
        <NavLinks>
          <NavLink to="/study-guides">Study Guides</NavLink>
          {(isAdmin || isSuperAdmin) && (
            <NavLink to="/admin">Admin</NavLink>
          )}
          {user ? (
            <Button onClick={handleSignOut}>Sign Out</Button>
          ) : (
            <Button onClick={() => navigate('/login')}>Sign In</Button>
          )}
        </NavLinks>
      </Container>
    </Nav>
  );
};

export default Navigation;
