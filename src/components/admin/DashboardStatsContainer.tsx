import React, { useState } from 'react';
import DashboardStats from './DashboardStats';
import styled from 'styled-components';

const LoadingWrapper = styled.div`
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
`;

const ErrorWrapper = styled.div`
  text-align: center;
  padding: 2rem;
  color: var(--error-color);
`;

const RetryButton = styled.button`
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: var(--primary-color-dark);
  }
`;

const DashboardStatsContainer: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const filters = React.useMemo(() => ({}), []);

  const handleRetry = () => {
    setError(null);
  };

  if (error) {
    return (
      <ErrorWrapper>
        <div>{error}</div>
        <RetryButton onClick={handleRetry}>Retry</RetryButton>
      </ErrorWrapper>
    );
  }

  return (
    <React.Suspense fallback={<LoadingWrapper>Loading dashboard...</LoadingWrapper>}>
      <DashboardStats filters={filters} onError={setError} />
    </React.Suspense>
  );
};

export default DashboardStatsContainer;
