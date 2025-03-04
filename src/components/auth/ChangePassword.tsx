import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { PasswordValidation } from '../../types';
import Input from '../shared/Input';
import Button from '../shared/Button';
import Card from '../shared/Card';
import { toast } from 'react-toastify';

interface ChangePasswordProps {
  onComplete?: () => void;
}

const Container = styled.div`
  max-width: 400px;
  margin: 2rem auto;
  padding: 0 1rem;
`;

const Title = styled.h1`
  text-align: center;
  color: var(--text-color);
  margin-bottom: 2rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ValidationList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0.5rem 0;
`;

const ValidationItem = styled.li<{ $valid: boolean }>`
  color: ${props => (props.$valid ? 'var(--success-color)' : 'var(--error-color)')};
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &::before {
    content: '${props => (props.$valid ? '✓' : '×')}';
    font-weight: bold;
  }
`;

const ErrorMessage = styled.div`
  color: var(--error-color);
  font-size: 0.875rem;
  margin-top: 0.5rem;
`;

const ChangePassword: React.FC<ChangePasswordProps> = ({ onComplete }) => {
  const { validatePassword, changePassword, passwordChangeRequired } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validation, setValidation] = useState<PasswordValidation>({
    hasMinLength: false,
    hasUpperCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setValidation(validatePassword(newPassword));
  }, [newPassword, validatePassword]);

  const isValid = (): boolean => {
    return (
      Object.values(validation).every(Boolean) &&
      newPassword === confirmPassword &&
      currentPassword.length > 0
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isValid()) {
      return;
    }

    try {
      setLoading(true);
      await changePassword(currentPassword, newPassword);
      toast.success('Password successfully changed');
      onComplete?.();
    } catch (err) {
      console.error('Error changing password:', err);
      setError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Title>{passwordChangeRequired ? 'Password Change Required' : 'Change Password'}</Title>
      <Card>
        <Form onSubmit={handleSubmit}>
          <Input
            type="password"
            label="Current Password"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            required
          />

          <div>
            <Input
              type="password"
              label="New Password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
            />
            <ValidationList>
              <ValidationItem $valid={validation.hasMinLength}>
                At least 8 characters long
              </ValidationItem>
              <ValidationItem $valid={validation.hasUpperCase}>
                Contains uppercase letter
              </ValidationItem>
              <ValidationItem $valid={validation.hasNumber}>Contains number</ValidationItem>
              <ValidationItem $valid={validation.hasSpecialChar}>
                Contains special character
              </ValidationItem>
            </ValidationList>
          </div>

          <Input
            type="password"
            label="Confirm New Password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
          />

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <Button type="submit" variant="primary" fullWidth disabled={!isValid() || loading}>
            {loading ? 'Changing Password...' : 'Change Password'}
          </Button>
        </Form>
      </Card>
    </Container>
  );
};

export default ChangePassword;
