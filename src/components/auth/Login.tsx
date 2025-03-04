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

const WarningBox = styled.div`
  background-color: rgba(255, 193, 7, 0.1);
  border: 1px solid #ffc107;
  color: #856404;
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
  const [error, setError] = useState<string | null>(null);
  const [showCredentials, setShowCredentials] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { signIn, user, userData, loading: authLoading, connectionError, dbError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Clear error when inputs change or connection status changes
  useEffect(() => {
    setError(null);
  }, [email, password, connectionError]);

  // Debug logging for auth state changes
  useEffect(() => {
    console.log('Auth state changed:', {
      user: user?.id,
      authLoading,
      connectionError,
      dbError
    });

    // Handle successful authentication - navigate immediately after user is authenticated
    if (user && !authLoading) {
      console.log('Login successful, navigating to admin');
      navigate('/admin', { replace: true });
    }
  }, [user, authLoading, navigate]);

  // Show credentials when appropriate
  useEffect(() => {
    if (error || connectionError || !email) {
      setShowCredentials(true);
    }
  }, [error, connectionError, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login form submitted');

    if (email === 'nojs2115@yahoo.com' && password === 'Password123!') {
      // Skip authentication entirely and navigate directly to admin
      console.log('Credentials match, navigating to admin');
      navigate('/admin', { replace: true });
      return;
    }

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setError(null);
      setIsLoggingIn(true);
      console.log('Attempting to sign in with:', email);
      
      const result = await signIn(email, password);
      console.log('Sign in successful');
      
      // Navigate immediately after successful sign in
      navigate('/admin', { replace: true });
    } catch (error) {
      console.error('Sign in error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
      
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
        setError('Unable to connect to the authentication service. Please try again.');
      } else if (errorMessage.includes('Invalid login')) {
        setError('Invalid email or password. Please try again.');
      } else {
        setError(errorMessage);
      }
      
      setPassword(''); // Clear password on any error
      setShowCredentials(true);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <LoginContainer>
      <Title>Sign In</Title>
      
      {connectionError && (
        <WarningBox>
          <strong>Connection Status:</strong> Having trouble connecting to the server. 
          <br /><br />
          You can try signing in (it might work), or continue without signing in to view the study guides.
          {showCredentials && (
            <>
              <br /><br />
              <strong>Super admin credentials:</strong>
              <br />
              Email: nojs2115@yahoo.com
              <br />
              Password: Password123!
            </>
          )}
        </WarningBox>
      )}
      
      {dbError && !connectionError && (
        <WarningBox>
          <strong>Database Status:</strong> Connected to authentication but having trouble with the database.
          <br /><br />
          You can still sign in, but some features may be limited.
        </WarningBox>
      )}
      
      {!connectionError && showCredentials && (
        <InfoBox>
          <strong>Super admin credentials:</strong>
          <br />
          Email: nojs2115@yahoo.com
          <br />
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
            disabled={isLoggingIn}
          />
          <Input
            type="password"
            label="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
            autoComplete="current-password"
            disabled={isLoggingIn}
          />
          <Button 
            type="submit" 
            variant="primary" 
            fullWidth 
            loading={isLoggingIn}
            disabled={isLoggingIn}
          >
            {isLoggingIn ? 'Signing In...' : 'Sign In'}
          </Button>
          
          <Button 
            type="button" 
            variant="secondary" 
            fullWidth 
            onClick={() => navigate('/study-guides')}
          >
            View Study Guides {connectionError ? 'Without Signing In' : ''}
          </Button>
        </Form>
      </Card>
    </LoginContainer>
  );
};

export default Login;
