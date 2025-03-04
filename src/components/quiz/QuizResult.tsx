import React from 'react';
import styled from 'styled-components';
import { QuestionWithOptions, QuizAnswerState } from '../../types';
import Card from '../shared/Card';
import Button from '../shared/Button';
import { useNavigate } from 'react-router-dom';

export interface QuizResultProps {
  questions: QuestionWithOptions[];
  answers: QuizAnswerState[];
  score: number;
  timeTaken: number;
  passed: boolean;
  certificateUrl?: string;
}

const Container = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 1rem;
`;

const ResultHeader = styled(Card)`
  text-align: center;
  margin-bottom: 2rem;
  padding: 2rem;
`;

const Score = styled.div<{ $passed: boolean }>`
  font-size: 3rem;
  font-weight: bold;
  color: ${props => (props.$passed ? 'var(--success-color)' : 'var(--error-color)')};
  margin-bottom: 1rem;
`;

const TimeTaken = styled.div`
  color: var(--text-secondary);
  margin-bottom: 1rem;
`;

const QuestionCard = styled(Card)`
  margin-bottom: 1rem;
`;

const QuestionTitle = styled.h3`
  color: var(--text-color);
  margin-bottom: 1rem;
`;

const OptionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

interface OptionProps {
  $selected: boolean;
  $correct: boolean;
}

const Option = styled.div<OptionProps>`
  padding: 1rem;
  border: 2px solid
    ${props =>
      props.$correct ? 'var(--success-color)' : props.$selected ? 'var(--error-color)' : '#e0e0e0'};
  border-radius: 4px;
  background-color: ${props =>
    props.$correct
      ? 'rgba(40, 167, 69, 0.1)'
      : props.$selected
        ? 'rgba(220, 53, 69, 0.1)'
        : 'white'};
  color: var(--text-color);
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
`;

const QuizResult: React.FC<QuizResultProps> = ({
  questions,
  answers,
  score,
  timeTaken,
  passed,
  certificateUrl,
}) => {
  const navigate = useNavigate();

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const downloadCertificate = () => {
    if (certificateUrl) {
      window.open(certificateUrl, '_blank');
    }
  };

  return (
    <Container>
      <ResultHeader>
        <Score $passed={passed}>{score}%</Score>
        <div>{passed ? 'Congratulations! You passed!' : 'Sorry, you did not pass.'}</div>
        <TimeTaken>Time taken: {formatTime(timeTaken)}</TimeTaken>
        <ActionButtons>
          <Button variant="primary" onClick={() => navigate('/study-guides')}>
            Back to Study Guides
          </Button>
          {passed && certificateUrl && (
            <Button variant="secondary" onClick={downloadCertificate}>
              Download Certificate
            </Button>
          )}
        </ActionButtons>
      </ResultHeader>

      {questions.map((question, index) => (
        <QuestionCard key={question.id}>
          <QuestionTitle>{question.content}</QuestionTitle>
          <OptionsList>
            {question.options.map((option, optionIndex) => {
              const isSelected = answers[index]?.selectedIndices.includes(optionIndex);
              return (
                <Option key={option.id} $selected={isSelected} $correct={option.is_correct}>
                  {option.option_text}
                </Option>
              );
            })}
          </OptionsList>
        </QuestionCard>
      ))}
    </Container>
  );
};

export default QuizResult;
