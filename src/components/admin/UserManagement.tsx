import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { User, UserRole } from '../../types';
import { userService } from '../../services/user.service';
import { useAuth } from '../../context/AuthContext';
import Card from '../shared/Card';
import Select from '../shared/Select';
import { toast } from 'react-toastify';

const Container = styled.div`
  padding: 2rem;
`;

const Title = styled.h2`
  color: var(--text-color);
  margin-bottom: 2rem;
`;

const UserGrid = styled.div`
  display: grid;
  gap: 1rem;
`;

const UserCard = styled(Card)`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr auto;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Email = styled.span`
  color: var(--text-color);
  font-weight: 500;
`;

const RoleLabel = styled.span`
  color: var(--text-secondary);
  font-size: 0.875rem;
`;

const StatsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
`;

const RoleSelect = styled(Select)`
  width: 150px;
`;

const SaveButton = styled.button<{ $disabled: boolean }>`
  padding: 0.5rem 1rem;
  background-color: ${props => (props.$disabled ? '#ccc' : 'var(--primary-color)')};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: ${props => (props.$disabled ? 'not-allowed' : 'pointer')};
  transition: background-color 0.2s;

  &:hover {
    background-color: ${props => (props.$disabled ? '#ccc' : 'var(--primary-dark)')};
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: var(--text-color);
`;

const ErrorMessage = styled.div`
  color: var(--error-color);
  text-align: center;
  margin: 2rem 0;
`;

interface UserStats {
  totalQuizzesTaken: number;
  averageScore: number;
  studyGuidesAccessed: number;
}

const UserManagement: React.FC = () => {
  const { isSuperAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userStats, setUserStats] = useState<Record<string, UserStats>>({});
  const [pendingRoleChanges, setPendingRoleChanges] = useState<Record<string, UserRole>>({});

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const fetchedUsers = await userService.getAllUsers();
      setUsers(fetchedUsers);
      
      // Load stats for each user
      const stats: Record<string, UserStats> = {};
      for (const user of fetchedUsers) {
        stats[user.id] = await userService.getUserStats(user.id);
      }
      setUserStats(stats);
      
      setError(null);
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    setPendingRoleChanges(prev => ({
      ...prev,
      [userId]: newRole
    }));
  };

  const handleSaveRole = async (userId: string) => {
    const newRole = pendingRoleChanges[userId];
    if (!newRole) return;

    try {
      await userService.updateUserRole(userId, newRole);
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      setPendingRoleChanges(prev => {
        const { [userId]: _, ...rest } = prev;
        return rest;
      });
      toast.success('User role updated successfully');
    } catch (err) {
      console.error('Error updating user role:', err);
      toast.error('Failed to update user role');
    }
  };

  if (loading) {
    return <LoadingMessage>Loading users...</LoadingMessage>;
  }

  if (error) {
    return <ErrorMessage>{error}</ErrorMessage>;
  }

  const roleOptions = [
    { value: 'user', label: 'User' },
    { value: 'admin', label: 'Admin' },
    { value: 'super_admin', label: 'Super Admin' }
  ];

  return (
    <Container>
      <Title>User Management {!isSuperAdmin && '(View Only)'}</Title>
      <UserGrid>
        {users.map(user => (
          <UserCard key={user.id}>
            <UserInfo>
              <Email>{user.email}</Email>
              <RoleLabel>Current Role: {user.role}</RoleLabel>
            </UserInfo>
            <StatsContainer>
              <div>Quizzes: {userStats[user.id]?.totalQuizzesTaken || 0}</div>
              <div>Avg Score: {Math.round(userStats[user.id]?.averageScore || 0)}%</div>
              <div>Guides: {userStats[user.id]?.studyGuidesAccessed || 0}</div>
            </StatsContainer>
            <RoleSelect
              options={roleOptions}
              value={pendingRoleChanges[user.id] || user.role}
              onChange={e => handleRoleChange(user.id, e.target.value as UserRole)}
              disabled={!isSuperAdmin}
            />
            <SaveButton
              onClick={() => handleSaveRole(user.id)}
              $disabled={!isSuperAdmin || !pendingRoleChanges[user.id]}
              disabled={!isSuperAdmin || !pendingRoleChanges[user.id]}
            >
              Save Role
            </SaveButton>
          </UserCard>
        ))}
      </UserGrid>
    </Container>
  );
};

export default UserManagement;
