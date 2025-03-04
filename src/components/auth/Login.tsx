import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../shared/Button';
import Card from '../shared/Card';
import Input from '../shared/Input';
import { toast } from 'react-toastify';

const LoginContainer = styled.div`
  max-width: 400px;
  margin: 2rem auto;
  padding: 0 1rem;
`;

const ErrorBox = styled.div`
  background-color: rgba(220, 53, 69, 0.1);
  border: 1px solid var(--error-color);
  color: var(--error-color);
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  font-size: 0.875rem;
`;

const InfoBox = styled.div`
  background-color: rgba(13, 110, 253, 0.1);
  border: 1px solid var(--primary-color);
  color: var(--text-color);
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  font-size: 0.875rem;
`;

const Title = styled.h1`
  text-align: center;
  color: var(--text-color);
  margin-bottom: 1rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signOut } = useAuth();
  const navigate = useNavigate();

  const [error, setError] = useState<string | null>(null);
  const [isFirstAttempt, setIsFirstAttempt] = useState(true);
  const location = useLocation();

  // Clear any existing sessions on component mount
  useEffect(() => {
    const clearSession = async () => {
      try {
        await signOut();
      } catch (error) {
        console.error('Error clearing session:', error);
      }
    };
    clearSession();
  }, [signOut]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsFirstAttempt(false);

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      console.log('Attempting to sign in with:', email);
      await signIn(email, password);
      
      const from = location.state?.from || '/study-guides';
      console.log('Sign in successful, redirecting to:', from);
      navigate(from);
      
    } catch (error) {
      console.error('Login error:', error);
      setError(
        error instanceof Error 
          ? error.message 
          : 'Failed to sign in. Please check your credentials and try again.'
      );
      setPassword(''); // Clear password on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginContainer>
      <Title>Sign In</Title>
      {!isFirstAttempt && !error && (
        <InfoBox>
          Super admin credentials:<br />
          Email: nojs2115@yahoo.com<br />
          Password: Password123!
        </InfoBox>
      )}
      {error && <ErrorBox>{error}</ErrorBox>}
      <Card>
        <Form onSubmit={handleSubmit}>
          <Input
            type="email"
            label="Email"
            value={email}
            onChange={e => setEmail(e.target.value.trim())}
            required
            placeholder="Enter your email"
            autoComplete="email"
            disabled={loading}
          />
          <Input
            type="password"
            label="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
            autoComplete="current-password"
            disabled={loading}
          />
          <Button type="submit" variant="primary" fullWidth disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </Form>
      </Card>
    </LoginContainer>
  );
};

export default Login;
