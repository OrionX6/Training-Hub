import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { studyGuideService } from '../../services/study-guide.service';
import { StudyGuide as StudyGuideType } from '../../types';
import Container from '../shared/Container';
import StudyGuideContent from './StudyGuideContent';
import { useAuth } from '../../context/AuthContext';

const ErrorMessage = styled.div`
  color: var(--error-color);
  text-align: center;
  padding: 2rem;
`;

const Header = styled.div`
  margin-bottom: 2rem;
  position: relative;
`;

const HeaderActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  font-size: 0.875rem;
  transition: color 0.2s;

  &:hover {
    color: var(--primary-color);
  }
`;

const SignInPrompt = styled.div`
  color: var(--text-secondary);
  font-size: 0.875rem;
  text-align: right;
`;

const Title = styled.h1`
  color: var(--text-color);
  margin-bottom: 0.5rem;
`;

const Description = styled.p`
  color: var(--text-secondary);
  font-size: 0.875rem;
`;

const ProgressBar = styled.div`
  background-color: #e0e0e0;
  border-radius: 4px;
  height: 8px;
  margin: 1rem 0;
  overflow: hidden;
`;

const Progress = styled.div<{ $percent: number }>`
  background-color: var(--primary-color);
  height: 100%;
  width: ${props => props.$percent}%;
  transition: width 0.3s ease;
`;

const ProgressText = styled.div`
  color: var(--text-secondary);
  font-size: 0.875rem;
  text-align: right;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: var(--text-color);
  font-size: 1.1rem;
`;

const ActionButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  margin-top: 1rem;

  &:hover {
    background-color: var(--primary-dark);
  }
`;

const RetryContainer = styled.div`
  text-align: center;
  padding: 2rem;
`;

const StudyGuide: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [guide, setGuide] = useState<StudyGuideType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [progress, setProgress] = useState({ completed: 0, total: 0 });

  useEffect(() => {
    const loadGuide = async () => {
      if (!id) {
        setError('Study guide ID is required');
        setLoading(false);
        return;
      }

      try {
        console.log('Loading study guide:', id);
        setLoading(true);
        const guide = await studyGuideService.getStudyGuideById(id);
        console.log('Study guide loaded:', guide);
        setGuide(guide);
        setError(null);
      } catch (err) {
        console.error('Error loading study guide:', err);
        setError('Failed to load study guide');
      } finally {
        setLoading(false);
      }
    };

    loadGuide();
  }, [id, retryCount]);

  const handleProgress = (completed: number, total: number) => {
    setProgress({ completed, total });
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  const handleBack = () => {
    navigate('/study-guides');
  };

  if (loading) {
    return (
      <Container>
        <LoadingMessage>Loading study guide...</LoadingMessage>
      </Container>
    );
  }

  if (error || !guide) {
    return (
      <Container>
        <RetryContainer>
          <ErrorMessage>{error || 'Study guide not found'}</ErrorMessage>
          <ActionButton onClick={handleRetry}>
            Retry {retryCount > 0 ? `(Attempt ${retryCount + 1})` : ''}
          </ActionButton>
          <ActionButton onClick={handleBack} style={{ marginLeft: '1rem' }}>
            Back to Study Guides
          </ActionButton>
        </RetryContainer>
      </Container>
    );
  }

  const progressPercent = progress.total > 0 ? (progress.completed / progress.total) * 100 : 0;

  return (
    <Container>
      <Header>
        <HeaderActions>
          <BackButton onClick={handleBack}>← Back to Study Guides</BackButton>
          {!user && <SignInPrompt>Sign in to track your progress</SignInPrompt>}
        </HeaderActions>

        <Title>{guide.title}</Title>
        <Description>{guide.description}</Description>
        {user && (
          <>
            <ProgressBar>
              <Progress $percent={progressPercent} />
            </ProgressBar>
            <ProgressText>
              {progress.completed} of {progress.total} questions completed (
              {Math.round(progressPercent)}%)
            </ProgressText>
          </>
        )}
      </Header>

      {guide.category && (
        <StudyGuideContent
          key={`${guide.id}-${guide.category}-${retryCount}`}
          guideId={guide.id}
          category={guide.category}
          onProgress={handleProgress}
        />
      )}
    </Container>
  );
};

export default StudyGuide;
