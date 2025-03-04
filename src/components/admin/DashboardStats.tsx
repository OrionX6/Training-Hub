import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { adminService } from '../../services/admin.service';
import { QuizResultFilters } from '../../types';
import Card from '../shared/Card';

interface DashboardStatsProps {
  filters?: QuizResultFilters;
}

interface Stats {
  totalQuizzes: number;
  passRate: number;
  averageScore: number;
  averageTime: number;
}

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled(Card)`
  padding: 1.5rem;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 600;
  color: var(--primary-color);
  margin: 0.5rem 0;
`;

const StatLabel = styled.div`
  color: var(--text-secondary);
  font-size: 0.875rem;
`;

const StatTrend = styled.div<{ $positive?: boolean }>`
  color: ${props => (props.$positive ? 'var(--success-color)' : 'var(--error-color)')};
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;

  &::before {
    content: '${props => (props.$positive ? '↑' : '↓')}';
  }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
`;

const ErrorState = styled.div`
  text-align: center;
  padding: 2rem;
  color: var(--error-color);
`;

const DashboardStats: React.FC<DashboardStatsProps> = ({ filters = {} }) => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const data = await adminService.getDashboardStats(filters);
        setStats(data);
        setError(null);
      } catch (err) {
        console.error('Error loading dashboard stats:', err);
        setError('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [filters]);

  if (loading) {
    return <LoadingState>Loading statistics...</LoadingState>;
  }

  if (error) {
    return <ErrorState>{error}</ErrorState>;
  }

  if (!stats) {
    return <ErrorState>No statistics available</ErrorState>;
  }

  const formatTime = (minutes: number): string => {
    const hrs = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  return (
    <StatsGrid>
      <StatCard>
        <StatLabel>Total Quizzes</StatLabel>
        <StatValue>{stats.totalQuizzes}</StatValue>
      </StatCard>

      <StatCard>
        <StatLabel>Pass Rate</StatLabel>
        <StatValue>{stats.passRate.toFixed(1)}%</StatValue>
        <StatTrend $positive={stats.passRate >= 70}>
          {stats.passRate >= 70 ? 'Above Target' : 'Below Target'}
        </StatTrend>
      </StatCard>

      <StatCard>
        <StatLabel>Average Score</StatLabel>
        <StatValue>{stats.averageScore.toFixed(1)}%</StatValue>
        <StatTrend $positive={stats.averageScore >= 75}>
          {stats.averageScore >= 75 ? 'Good' : 'Needs Improvement'}
        </StatTrend>
      </StatCard>

      <StatCard>
        <StatLabel>Average Completion Time</StatLabel>
        <StatValue>{formatTime(stats.averageTime)}</StatValue>
      </StatCard>
    </StatsGrid>
  );
};

export default DashboardStats;
