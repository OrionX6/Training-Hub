import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { QuizAccess, QuestionWithOptions, QuizAnswerState } from '../../types';
import { quizService } from '../../services/quiz.service';
import Card from '../shared/Card';

interface QuizContentProps {
  quizAccess: QuizAccess;
  onComplete: (score: number, questions: QuestionWithOptions[], answers: QuizAnswerState[], timeTaken: number) => void;
}

const Container = styled.div`
  margin-bottom: 2rem;
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
}

const Option = styled.button<OptionProps>`
  padding: 1rem;
  border: 2px solid ${props => (props.$selected ? 'var(--primary-color)' : '#e0e0e0')};
  border-radius: 4px;
  background-color: ${props => (props.$selected ? 'rgba(28, 68, 127, 0.1)' : 'white')};
  color: var(--text-color);
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: var(--primary-color);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px var(--primary-color);
  }
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

const QuizContent: React.FC<QuizContentProps> = ({ quizAccess, onComplete }) => {
  const [questions, setQuestions] = useState<QuestionWithOptions[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswerState[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const startTime = useRef(Date.now());
  const optionsRef = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setLoading(true);
        const questions = await quizService.getQuizQuestions(quizAccess.quiz_id);
        setQuestions(questions);
        setAnswers(new Array(questions.length).fill(null));
      } catch (err) {
        console.error('Error loading questions:', err);
        setError('Failed to load quiz questions');
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [quizAccess.quiz_id]);

  const handleOptionSelect = (questionIndex: number, optionIndex: number) => {
    setAnswers(prev => {
      const newAnswers = [...prev];
      const currentQuestion = questions[currentIndex];
      const isMultiSelect = currentQuestion.type === 'multiple_choice_multiple' ||
        currentQuestion.type === 'check_all_that_apply';

      const currentAnswer = newAnswers[currentIndex] || { questionIndex, selectedIndices: [] };
      const selectedIndices = isMultiSelect
        ? currentAnswer.selectedIndices.includes(optionIndex)
          ? currentAnswer.selectedIndices.filter(id => id !== optionIndex)
          : [...currentAnswer.selectedIndices, optionIndex].sort()
        : [optionIndex];

      newAnswers[currentIndex] = { questionIndex, selectedIndices };
      return newAnswers;
    });
  };

  const calculateScore = (): number => {
    let correctAnswers = 0;
    questions.forEach((question, index) => {
      const answer = answers[index];
      if (!answer) return;

      const correctOptionIndices = question.options
        .map((option, index) => option.is_correct ? index : -1)
        .filter(index => index !== -1)
        .sort();

      if (
        answer.selectedIndices.length === correctOptionIndices.length &&
        answer.selectedIndices.every((index, i) => index === correctOptionIndices[i])
      ) {
        correctAnswers++;
      }
    });

    return (correctAnswers / questions.length) * 100;
  };

  const handleSubmit = () => {
    const timeTaken = Math.round((Date.now() - startTime.current) / 1000 / 60); // Convert to minutes
    const score = calculateScore();
    onComplete(score, questions, answers, timeTaken);
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  if (loading) {
    return (
      <Container>
        <Card>Loading quiz questions...</Card>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Card>
          <div style={{ color: 'var(--error-color)', textAlign: 'center' }}>{error}</div>
        </Card>
      </Container>
    );
  }

  const currentQuestion = questions[currentIndex];
  if (!currentQuestion) {
    return (
      <Container>
        <Card>
          <div style={{ textAlign: 'center' }}>No questions available</div>
        </Card>
      </Container>
    );
  }

  const currentAnswer = answers[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  return (
    <Container>
      <QuestionCard>
        <QuestionTitle>{currentQuestion.content}</QuestionTitle>
        <OptionsList role="radiogroup" aria-labelledby={`question-${currentIndex}`}>
          {currentQuestion.options.map((option, optionIndex) => (
            <Option
              key={option.id}
              ref={el => (optionsRef.current[optionIndex] = el)}
              onClick={() => handleOptionSelect(currentIndex, optionIndex)}
              $selected={(currentAnswer?.selectedIndices || []).includes(optionIndex)}
              role="radio"
              aria-checked={(currentAnswer?.selectedIndices || []).includes(optionIndex)}
            >
              {option.option_text}
            </Option>
          ))}
        </OptionsList>

        <ActionButton
          onClick={isLastQuestion ? handleSubmit : nextQuestion}
          disabled={!currentAnswer?.selectedIndices.length}
        >
          {isLastQuestion ? 'Submit Quiz' : 'Next Question'}
        </ActionButton>
      </QuestionCard>
    </Container>
  );
};

export default QuizContent;
