import React from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import DashboardStatsContainer from './DashboardStatsContainer';
import StudyGuideManager from './StudyGuideManager';
import UserManagement from './UserManagement';

const AdminContainer = styled.div`
  padding: 2rem;
`;

const AdminHeader = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  color: var(--text-color);
  margin-bottom: 1rem;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid var(--border-color);
`;

const TabButton = styled.button<{ $active?: boolean }>`
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  color: ${props => props.$active ? 'var(--primary-color)' : 'var(--text-color)'};
  border-bottom: 2px solid ${props => props.$active ? 'var(--primary-color)' : 'transparent'};
  cursor: pointer;
  font-weight: ${props => props.$active ? '600' : '400'};
  transition: all 0.2s ease-in-out;

  &:hover {
    color: var(--primary-color);
  }
`;

const Admin: React.FC = () => {
  const { userData, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Debug log to check auth state
  React.useEffect(() => {
    console.log('Admin component auth state:', {
      userData,
      loading,
      pathname: location.pathname
    });
  }, [userData, loading, location]);

  const handleTabClick = (path: string) => {
    navigate(path);
  };

  return (
    <AdminContainer>
      <AdminHeader>
        <Title>Admin Dashboard</Title>
        <TabContainer>
          <TabButton
            onClick={() => handleTabClick('/admin')}
            $active={location.pathname === '/admin'}
            type="button"
          >
            Dashboard
          </TabButton>
          <TabButton
            onClick={() => handleTabClick('/admin/study-guides')}
            $active={location.pathname.startsWith('/admin/study-guides')}
            type="button"
          >
            Study Guides
          </TabButton>
          <TabButton
            onClick={() => handleTabClick('/admin/users')}
            $active={location.pathname === '/admin/users'}
            type="button"
          >
            Users
          </TabButton>
        </TabContainer>
      </AdminHeader>

      <Routes>
        <Route path="/" element={<DashboardStatsContainer />} />
        <Route path="study-guides/*" element={<StudyGuideManager />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminContainer>
  );
};

export default Admin;
