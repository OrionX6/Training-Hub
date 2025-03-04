import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { User, UserRole } from '../../types';
import { localUserService } from '../../services/local-user.service';
import { useAuth } from '../../context/AuthContext';
import Card from '../shared/Card';
import Select from '../shared/Select';
import Input from '../shared/Input';
import Button from '../shared/Button';
import { toast } from 'react-toastify';

const Container = styled.div`
  padding: 2rem;
`;

const Title = styled.h2`
  color: var(--text-color);
  margin-bottom: 1rem;
`;

const AddUserCard = styled(Card)`
  margin-bottom: 2rem;
  padding: 1.5rem;
`;

const AddUserTitle = styled.h3`
  color: var(--text-color);
  margin-bottom: 1.5rem;
`;

const AddUserForm = styled.form`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr auto;
  gap: 1rem;
  align-items: end;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormDivider = styled.div`
  height: 1px;
  background-color: var(--border-color);
  margin: 1.5rem 0;
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
  
  // New user form state
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('user');
  const [creatingUser, setCreatingUser] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const fetchedUsers = await localUserService.getAllUsers();
      setUsers(fetchedUsers);
      
      // Load stats for each user
      const stats: Record<string, UserStats> = {};
      for (const user of fetchedUsers) {
        stats[user.id] = await localUserService.getUserStats(user.id);
      }
      setUserStats(stats);
      
      setError(null);
    } catch (err) {
      console.error('Error loading users:', err);
      setError('No current users');
      setUsers([]); // Set empty array to ensure we can still show the form
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
      await localUserService.updateUserRole(userId, newRole);
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

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newUserEmail || !newUserPassword) {
      toast.error('Please enter both email and password');
      return;
    }

    try {
      setCreatingUser(true);
      const newUser = await localUserService.createUser(newUserEmail, newUserPassword, newUserRole);
      
      // Add the new user to the list
      setUsers(prev => [...prev, newUser]);
      
      // Reset form
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserRole('user');
      
      toast.success(`User ${newUserEmail} created successfully`);
    } catch (err) {
      console.error('Error creating user:', err);
      toast.error(`Failed to create user: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setCreatingUser(false);
    }
  };

  const roleOptions = [
    { value: 'user', label: 'User' },
    { value: 'admin', label: 'Admin' },
    { value: 'super_admin', label: 'Super Admin' }
  ];

  if (loading) {
    return <LoadingMessage>Loading users...</LoadingMessage>;
  }

  return (
    <Container>
      <Title>User Management</Title>
      
      <AddUserCard>
        <AddUserTitle>Add New User</AddUserTitle>
        <AddUserForm onSubmit={handleCreateUser}>
          <Input
            type="email"
            label="Email"
            value={newUserEmail}
            onChange={e => setNewUserEmail(e.target.value.trim())}
            placeholder="user@example.com"
            required
            disabled={creatingUser}
          />
          <Input
            type="password"
            label="Password"
            value={newUserPassword}
            onChange={e => setNewUserPassword(e.target.value)}
            placeholder="Password"
            required
            disabled={creatingUser}
          />
          <Select
            label="Role"
            options={roleOptions}
            value={newUserRole}
            onChange={e => setNewUserRole(e.target.value as UserRole)}
            disabled={creatingUser}
          />
          <Button
            type="submit"
            variant="primary"
            loading={creatingUser}
            disabled={creatingUser || !newUserEmail || !newUserPassword}
          >
            {creatingUser ? 'Creating...' : 'Add User'}
          </Button>
        </AddUserForm>
      </AddUserCard>
      
      <FormDivider />
      
      <Title>Existing Users</Title>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      {!error && users.length === 0 ? (
        <Card>
          <p style={{ padding: '1rem', textAlign: 'center' }}>No users found. Add a user to get started.</p>
        </Card>
      ) : (
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
                disabled={!isSuperAdmin || !pendingRoleChanges[user.id] ? true : undefined}
              >
                Save Role
              </SaveButton>
            </UserCard>
          ))}
        </UserGrid>
      )}
    </Container>
  );
};

export default UserManagement;
