import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { QuizAccess as QuizAccessType, User } from '../../types';
import { quizService } from '../../services/quiz.service';
import Card from '../shared/Card';
import Input from '../shared/Input';
import Button from '../shared/Button';
import Quiz from './Quiz';

const Container = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 1rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ErrorMessage = styled.div`
  color: var(--error-color);
  text-align: center;
  margin-bottom: 1rem;
`;

const QuizAccess: React.FC = () => {
  const navigate = useNavigate();
  const [quizAccess, setQuizAccess] = useState<QuizAccessType | null>(null);
  const [userData, setUserData] = useState<User>({
    id: '',
    email: '',
    role: 'user',
    ldap: '',
    supervisor: '',
    market: '',
    password_change_required: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [validated, setValidated] = useState(false);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('token');
    if (token) {
      validateToken(token);
    }
  }, []);

  const validateToken = async (token: string) => {
    try {
      setLoading(true);
      const access = await quizService.validateQuizAccess(token);
      if (access) {
        setQuizAccess(access);
      } else {
        setError('Invalid or expired quiz access token');
      }
    } catch (err) {
      console.error('Error validating token:', err);
      setError('Failed to validate quiz access');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid()) {
      setValidated(true);
    }
  };

  const isValid = (): boolean => {
    return !!(userData.ldap && userData.supervisor && userData.market);
  };

  if (loading) {
    return (
      <Container>
        <Card>Loading...</Card>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Card>
          <ErrorMessage>{error}</ErrorMessage>
          <Button variant="primary" onClick={() => navigate('/study-guides')}>
            Back to Study Guides
          </Button>
        </Card>
      </Container>
    );
  }

  if (!quizAccess) {
    return (
      <Container>
        <Card>
          <ErrorMessage>No quiz access token provided</ErrorMessage>
          <Button variant="primary" onClick={() => navigate('/study-guides')}>
            Back to Study Guides
          </Button>
        </Card>
      </Container>
    );
  }

  if (!validated) {
    return (
      <Container>
        <Card>
          <h2>Quiz Registration</h2>
          <p>Please provide your information to begin the quiz:</p>
          <Form onSubmit={handleSubmit}>
            <Input
              label="LDAP Username"
              value={userData.ldap || ''}
              onChange={e => setUserData(prev => ({ ...prev, ldap: e.target.value }))}
              required
            />
            <Input
              label="Supervisor Name"
              value={userData.supervisor || ''}
              onChange={e => setUserData(prev => ({ ...prev, supervisor: e.target.value }))}
              required
            />
            <Input
              label="Market"
              value={userData.market || ''}
              onChange={e => setUserData(prev => ({ ...prev, market: e.target.value }))}
              required
            />
            <Button type="submit" variant="primary" fullWidth disabled={!isValid()}>
              Start Quiz
            </Button>
          </Form>
        </Card>
      </Container>
    );
  }

  return <Quiz quizAccess={quizAccess} userData={userData} />;
};

export default QuizAccess;
