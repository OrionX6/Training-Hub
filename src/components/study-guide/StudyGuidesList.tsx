import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { studyGuideService } from '../../services/study-guide.service';
import { StudyGuide } from '../../types';
import Card from '../shared/Card';
import Container from '../shared/Container';
import Select from '../shared/Select';

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  color: var(--text-color);
  margin-bottom: 1.5rem;
  text-align: center;
`;

const FilterContainer = styled.div`
  max-width: 300px;
  margin: 0 auto 2rem;
`;

const GuideCard = styled(Card)`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const GuideTitle = styled.h2`
  color: var(--text-color);
  margin-bottom: 1rem;
  font-size: 1.25rem;
`;

const GuideDescription = styled.p`
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-bottom: 1rem;
  flex-grow: 1;
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
`;

const ErrorContainer = styled.div`
  text-align: center;
  padding: 2rem;
  color: var(--error-color);
`;

const StudyGuidesList: React.FC = () => {
  const [guides, setGuides] = useState<StudyGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const navigate = useNavigate();

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(guides.map(guide => guide.category)));
    return [
      { value: 'all', label: 'All Categories' },
      ...uniqueCategories.map(category => ({
        value: category || '',
        label: category || 'Uncategorized',
      })),
    ];
  }, [guides]);

  const filteredGuides = useMemo(() => {
    if (selectedCategory === 'all') return guides;
    return guides.filter(guide => guide.category === selectedCategory);
  }, [guides, selectedCategory]);

  useEffect(() => {
    const loadGuides = async () => {
      try {
        setLoading(true);
        const data = await studyGuideService.getStudyGuides();
        setGuides(data);
        setError(null);
      } catch (err) {
        console.error('Error loading study guides:', err);
        setError('Failed to load study guides');
      } finally {
        setLoading(false);
      }
    };

    loadGuides();
  }, []);

  if (loading) {
    return (
      <Container>
        <LoadingContainer>Loading study guides...</LoadingContainer>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorContainer>{error}</ErrorContainer>
      </Container>
    );
  }

  if (guides.length === 0) {
    return (
      <Container>
        <LoadingContainer>No study guides available</LoadingContainer>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Study Guides</Title>
        <FilterContainer>
          <Select
            options={categories}
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            label="Filter by Category"
            fullWidth
          />
        </FilterContainer>
      </Header>
      <Grid>
        {filteredGuides.map(guide => (
          <GuideCard
            key={guide.id}
            onClick={() => navigate(`/study-guides/${guide.id}`)}
            elevation="medium"
            variant="elevated"
          >
            <GuideTitle>{guide.title}</GuideTitle>
            <GuideDescription>{guide.description}</GuideDescription>
            {guide.category && (
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Category: {guide.category}
              </div>
            )}
          </GuideCard>
        ))}
      </Grid>
    </Container>
  );
};

export default StudyGuidesList;
