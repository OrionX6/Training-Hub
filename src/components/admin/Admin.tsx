import React from 'react';
import { Route, Routes, Navigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import UserManagement from './UserManagement';
import StudyGuideManager from './StudyGuideManager';
import DashboardStats from './DashboardStats';
import Card from '../shared/Card';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const NavContainer = styled(Card)`
  margin-bottom: 2rem;
`;

const NavList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  gap: 1rem;
`;

const NavItem = styled(Link)<{ $active?: boolean }>`
  color: var(--text-color);
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  background-color: ${props => (props.$active ? 'var(--primary-color)' : 'transparent')};
  color: ${props => (props.$active ? 'white' : 'var(--text-color)')};
  transition: background-color 0.2s;

  &:hover {
    background-color: ${props => (props.$active ? 'var(--primary-color)' : 'rgba(0, 0, 0, 0.05)')};
  }
`;

const Admin: React.FC = () => {
  const { isSuperAdmin } = useAuth();
  const currentPath = window.location.pathname;

  return (
    <Container>
      <NavContainer>
        <NavList>
          <li>
            <NavItem to="/admin/dashboard" $active={currentPath === '/admin/dashboard'}>
              Dashboard
            </NavItem>
          </li>
          <li>
            <NavItem to="/admin/study-guides" $active={currentPath === '/admin/study-guides'}>
              Study Guides
            </NavItem>
          </li>
          {isSuperAdmin && (
            <li>
              <NavItem to="/admin/users" $active={currentPath === '/admin/users'}>
                User Management
              </NavItem>
            </li>
          )}
        </NavList>
      </NavContainer>

      <Routes>
        <Route path="dashboard" element={<DashboardStats />} />
        <Route path="study-guides" element={<StudyGuideManager />} />
        {isSuperAdmin && <Route path="users" element={<UserManagement />} />}
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </Container>
  );
};

export default Admin;
