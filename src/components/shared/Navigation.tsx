import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import Button from './Button';
import { useLocation } from 'react-router-dom';

const Nav = styled.nav`
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1rem;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled(Link)`
  color: var(--primary-color);
  text-decoration: none;
  font-size: 1.5rem;
  font-weight: bold;
`;

const NavLinks = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const NavLink = styled(Link)`
  color: var(--text-color);
  text-decoration: none;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
`;

interface StyledButtonProps {
  isOpen: boolean;
}

const UserName = styled.button<StyledButtonProps>`
  color: #666;
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;

  &:after {
    content: '▼';
    font-size: 0.8em;
    transition: transform 0.2s;
    transform: ${props => (props.isOpen ? 'rotate(180deg)' : 'rotate(0)')};
  }

  &:hover {
    color: var(--primary-color);
  }
`;

const AlertDot = styled.span`
  position: absolute;
  top: 0;
  right: -4px;
  width: 8px;
  height: 8px;
  background-color: var(--error-color);
  border-radius: 50%;
  display: block;
`;

interface StyledMenuProps {
  isOpen: boolean;
}

const UserMenu = styled.div<StyledMenuProps>`
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  padding: 0.5rem;
  min-width: 200px;
  opacity: ${props => (props.isOpen ? 1 : 0)};
  visibility: ${props => (props.isOpen ? 'visible' : 'hidden')};
  transform: translateY(${props => (props.isOpen ? '0' : '-10px')});
  transition: all 0.2s;
  margin-top: 0.5rem;
  z-index: 100;
`;

const MenuItem = styled(Link)`
  display: block;
  padding: 0.5rem 1rem;
  color: var(--text-color);
  text-decoration: none;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
`;

const MenuButton = styled.button`
  display: block;
  width: 100%;
  padding: 0.5rem 1rem;
  color: var(--text-color);
  background: none;
  border: none;
  text-align: left;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  &.danger {
    color: var(--error-color);
  }
`;

const PasswordAlert = styled.span`
  color: var(--error-color);
  font-size: 0.75rem;
  padding: 2px 6px;
  border-radius: 4px;
  background-color: rgba(220, 53, 69, 0.1);
`;

const Navigation: React.FC = () => {
  const { user, userData, isAdmin, isSuperAdmin, signOut, passwordChangeRequired } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      setMenuOpen(false);
      navigate('/');
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <Nav>
      <Container>
        <Logo to="/">Training Hub</Logo>
        <NavLinks>
          <NavLink to="/study-guides">Study Guides</NavLink>
          {user && <NavLink to="/quiz">Quiz</NavLink>}
          {(isAdmin || isSuperAdmin) && <NavLink to="/admin">Admin Dashboard</NavLink>}
          {user ? (
            <UserInfo>
              <UserName
                ref={buttonRef}
                onClick={() => setMenuOpen(!menuOpen)}
                aria-expanded={menuOpen}
                aria-haspopup="true"
                isOpen={menuOpen}
              >
                {userData?.email}
                {passwordChangeRequired && <AlertDot title="Password change required" />}
              </UserName>
              <UserMenu ref={menuRef} isOpen={menuOpen} role="menu">
                <MenuItem to="/change-password" onClick={closeMenu} role="menuitem">
                  Change Password
                  {passwordChangeRequired && <PasswordAlert>Required</PasswordAlert>}
                </MenuItem>
                <MenuButton className="danger" onClick={handleSignOut} role="menuitem">
                  Sign Out
                </MenuButton>
              </UserMenu>
            </UserInfo>
          ) : (
            <Button variant="primary" size="small" onClick={() => navigate('/login')}>
              Sign In
            </Button>
          )}
        </NavLinks>
      </Container>
    </Nav>
  );
};

export default Navigation;
