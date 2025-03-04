import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { User, UserRole } from '../../types';
import { adminService } from '../../services/admin.service';
import { toast } from 'react-toastify';
import Card from '../shared/Card';
import Select from '../shared/Select';
import Button from '../shared/Button';
import ConfirmDialog from '../shared/ConfirmDialog';

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
`;

const Th = styled.th`
  text-align: left;
  padding: 0.75rem;
  border-bottom: 2px solid var(--border-color);
  color: var(--text-secondary);
`;

const Td = styled.td`
  padding: 0.75rem;
  border-bottom: 1px solid var(--border-color);
`;

const RoleSelect = styled(Select)`
  min-width: 150px;
`;

const ActionButton = styled(Button)`
  margin-left: 0.5rem;
`;

const roleOptions = [
  { value: 'user', label: 'User' },
  { value: 'admin', label: 'Admin' },
  { value: 'super_admin', label: 'Super Admin' },
];

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const users = await adminService.getUsers();
      setUsers(users);
      setError(null);
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (user: User, newRole: UserRole) => {
    try {
      await adminService.updateUserRole(user.id, newRole);
      setUsers(users.map(u => (u.id === user.id ? { ...u, role: newRole } : u)));
      toast.success('User role updated successfully');
    } catch (err) {
      console.error('Error updating user role:', err);
      toast.error('Failed to update user role');
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUserId) return;

    try {
      const tempPassword = await adminService.resetUserPassword(selectedUserId);
      toast.success(`Password reset successful. Temporary password: ${tempPassword}`, {
        autoClose: false,
      });
    } catch (err) {
      console.error('Error resetting password:', err);
      toast.error('Failed to reset password');
    } finally {
      setShowResetDialog(false);
      setSelectedUserId(null);
    }
  };

  if (loading) {
    return <Card>Loading users...</Card>;
  }

  if (error) {
    return (
      <Card>
        <div style={{ color: 'var(--error-color)', textAlign: 'center' }}>{error}</div>
        <Button variant="primary" onClick={loadUsers}>
          Retry
        </Button>
      </Card>
    );
  }

  return (
    <Card>
      <h2>User Management</h2>
      <Table>
        <thead>
          <tr>
            <Th>Email</Th>
            <Th>LDAP</Th>
            <Th>Role</Th>
            <Th>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <Td>{user.email}</Td>
              <Td>{user.ldap || '-'}</Td>
              <Td>
                <RoleSelect
                  value={user.role}
                  onChange={e => handleRoleChange(user, e.target.value as UserRole)}
                  options={roleOptions}
                />
              </Td>
              <Td>
                <ActionButton
                  variant="secondary"
                  onClick={() => {
                    setSelectedUserId(user.id);
                    setShowResetDialog(true);
                  }}
                >
                  Reset Password
                </ActionButton>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>

      <ConfirmDialog
        title="Reset Password"
        message="Are you sure you want to reset this user's password? They will be required to change it on next login."
        onConfirm={handleResetPassword}
        onClose={() => {
          setShowResetDialog(false);
          setSelectedUserId(null);
        }}
        isOpen={showResetDialog}
      />
    </Card>
  );
};

export default UserManagement;
