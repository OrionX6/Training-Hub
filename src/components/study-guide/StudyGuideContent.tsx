import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { QuestionWithOptions } from '../../types';
import { studyGuideService } from '../../services/study-guide.service';
import Card from '../shared/Card';
import { useAuth } from '../../context/AuthContext';

interface StudyGuideContentProps {
  guideId: string;
  category: string;
  onProgress: (completed: number, total: number) => void;
}

const Container = styled.div`
  margin-bottom: 2rem;
  max-width: 800px;
  margin: 0 auto;
`;

const QuestionCard = styled(Card)`
  margin-bottom: 1.5rem;
`;

const QuestionType = styled.div`
  color: var(--text-secondary);
  font-size: 0.875rem;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
  font-weight: 500;
`;

const QuestionTitle = styled.h3`
  color: var(--text-color);
  margin-bottom: 1rem;
`;

const OptionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

interface OptionProps {
  $selected: boolean;
  $correct?: boolean;
  $incorrect?: boolean;
  $showResult: boolean;
}

const Option = styled.button<OptionProps>`
  padding: 1rem;
  border: 2px solid
    ${props => {
      if (props.$showResult) {
        if (props.$correct) return 'var(--success-color)';
        if (props.$incorrect) return 'var(--error-color)';
      }
      return props.$selected ? 'var(--primary-color)' : '#e0e0e0';
    }};
  border-radius: 4px;
  background-color: ${props => {
    if (props.$showResult) {
      if (props.$correct) return 'rgba(40, 167, 69, 0.1)';
      if (props.$incorrect) return 'rgba(220, 53, 69, 0.1)';
    }
    return props.$selected ? 'rgba(28, 68, 127, 0.1)' : 'white';
  }};
  color: var(--text-color);
  text-align: left;
  cursor: ${props => (props.$showResult ? 'default' : 'pointer')};
  transition: all 0.2s;
  opacity: ${props => (props.$showResult && !props.$correct && !props.$incorrect ? 0.5 : 1)};

  &:hover {
    border-color: ${props => (props.$showResult ? 'inherit' : 'var(--primary-color)')};
  }
`;

const ExplanationBox = styled.div`
  background-color: var(--background-secondary);
  padding: 1rem;
  border-radius: 4px;
  margin-top: 1rem;
  font-size: 0.9rem;
  color: var(--text-color);
`;

const ActionButton = styled.button`
  width: 100%;
  padding: 1rem;
  margin-top: 1rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--primary-dark);
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: var(--error-color);
  text-align: center;
  margin-bottom: 1rem;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: var(--text-color);
  font-size: 1.1rem;
`;

const NoQuestionsMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: var(--text-color);
`;

const StudyGuideContent: React.FC<StudyGuideContentProps> = ({ guideId, category, onProgress }) => {
  const { user } = useAuth();

  const [state, setState] = useState<{
    questions: QuestionWithOptions[];
    currentIndex: number;
    userSelections: Record<string, string[]>;
    showResults: Record<string, boolean>;
    error: string | null;
    loading: boolean;
    retryCount: number;
  }>({
    questions: [],
    currentIndex: 0,
    userSelections: {},
    showResults: {},
    error: null,
    loading: true,
    retryCount: 0,
  });

  const loadQuestions = useCallback(async () => {
    if (!guideId || !category) return;

    console.log('Loading questions for guide:', guideId, 'category:', category);
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const questions = await studyGuideService.getQuestionsByCategory(guideId, category);
      console.log('Questions loaded:', questions);

      setState(prev => ({
        ...prev,
        questions,
        loading: false,
        error: null,
      }));

      onProgress(0, questions.length);
    } catch (err) {
      console.error('Error loading questions:', err);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load questions',
        retryCount: prev.retryCount + 1,
      }));
    }
  }, []); // Empty dependency array since we access props directly in the function

  useEffect(() => {
    loadQuestions();
  }, [guideId, category]); // Only reload when guide ID or category changes

  const handleOptionSelect = (questionId: string, optionId: string) => {
    if (state.showResults[questionId]) return;

    setState(prev => {
      const currentAnswer = prev.userSelections[questionId] || [];
      const currentQuestion = prev.questions[prev.currentIndex];

      const isMultiSelect =
        currentQuestion.type === 'multiple_choice_multiple' ||
        currentQuestion.type === 'check_all_that_apply';

      const selectedIndices = isMultiSelect
        ? currentAnswer.includes(optionId)
          ? currentAnswer.filter(id => id !== optionId)
          : [...currentAnswer, optionId].sort()
        : [optionId];

      return {
        ...prev,
        userSelections: { ...prev.userSelections, [questionId]: selectedIndices },
      };
    });
  };

  const checkAnswer = async (questionId: string) => {
    const currentQuestion = state.questions[state.currentIndex];
    if (!currentQuestion?.options) return;

    const isCorrect = isAnswerCorrect(questionId);
    setState(prev => ({
      ...prev,
      showResults: { ...prev.showResults, [questionId]: true },
    }));

    if (user) {
      try {
        await studyGuideService.submitProgress(guideId, questionId, isCorrect);
        const completed = Object.keys(state.showResults).length + 1;
        onProgress(completed, state.questions.length);
      } catch (error) {
        console.error('Error submitting progress:', error);
      }
    }
  };

  const nextQuestion = () => {
    if (state.currentIndex < state.questions.length - 1) {
      setState(prev => ({
        ...prev,
        currentIndex: prev.currentIndex + 1,
      }));
    }
  };

  const isAnswerCorrect = (questionId: string): boolean => {
    if (!state.questions.length) return false;
    const question = state.questions.find(q => q.id === questionId);
    if (!question?.options) return false;

    const correctOptionIds = question.options.filter(o => o.is_correct).map(o => o.id);
    const userSelectedIds = state.userSelections[questionId] || [];

    return (
      correctOptionIds.length === userSelectedIds.length &&
      correctOptionIds.every(id => userSelectedIds.includes(id))
    );
  };

  if (state.loading) {
    return (
      <Container>
        <LoadingMessage>Loading questions...</LoadingMessage>
      </Container>
    );
  }

  if (state.error) {
    return (
      <Container>
        <Card>
          <ErrorMessage>{state.error}</ErrorMessage>
          <ActionButton onClick={loadQuestions}>
            Retry Loading Questions {state.retryCount > 0 ? `(Attempt ${state.retryCount})` : ''}
          </ActionButton>
        </Card>
      </Container>
    );
  }

  if (!state.questions.length) {
    return (
      <Container>
        <Card>
          <NoQuestionsMessage>No questions available</NoQuestionsMessage>
        </Card>
      </Container>
    );
  }

  const getQuestionTypeDisplay = (type: string): string => {
    switch (type) {
      case 'multiple_choice':
        return 'Multiple Choice';
      case 'multiple_choice_multiple':
        return 'Multiple Select';
      case 'check_all_that_apply':
        return 'Check All That Apply';
      case 'true_false':
        return 'True/False';
      default:
        return type;
    }
  };

  const isMultiSelect = (type: string): boolean =>
    type === 'multiple_choice_multiple' || type === 'check_all_that_apply';

  return (
    <Container>
      {state.questions.map(question => (
        <QuestionCard key={question.id}>
          <QuestionType>{getQuestionTypeDisplay(question.type)}</QuestionType>
          <QuestionTitle>{question.content}</QuestionTitle>
          <OptionsList role="listbox" aria-label="Answer options">
            {question.options.map(option => (
              <Option
                key={option.id}
                onClick={() => handleOptionSelect(question.id, option.id)}
                $selected={(state.userSelections[question.id] || []).includes(option.id)}
                $showResult={state.showResults[question.id]}
                $correct={state.showResults[question.id] && option.is_correct}
                $incorrect={
                  state.showResults[question.id] &&
                  (state.userSelections[question.id] || []).includes(option.id) &&
                  !option.is_correct
                }
                role="option"
                aria-selected={(state.userSelections[question.id] || []).includes(option.id)}
                disabled={state.showResults[question.id]}
              >
                {option.option_text}
              </Option>
            ))}
          </OptionsList>

          {state.showResults[question.id] && (
            <ExplanationBox>
              <div style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>
                {isAnswerCorrect(question.id) ? '✓ Correct!' : '✗ Incorrect'}
              </div>
              {question.explanation}
            </ExplanationBox>
          )}

          {!state.showResults[question.id] && (
            <ActionButton
              onClick={() => checkAnswer(question.id)}
              disabled={!(state.userSelections[question.id] || []).length}
            >
              {isMultiSelect(question.type) ? 'Submit Answers' : 'Check Answer'}
            </ActionButton>
          )}
        </QuestionCard>
      ))}
    </Container>
  );
};

export default StudyGuideContent;
