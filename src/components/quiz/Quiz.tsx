import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QuizAccess, User, QuizAnswerState, QuestionWithOptions } from '../../types';
import QuizContent from './QuizContent';
import QuizResult from './QuizResult';
import ConfirmDialog from '../shared/ConfirmDialog';
import { quizService } from '../../services/quiz.service';
import { toast } from 'react-toastify';

interface QuizProps {
  quizAccess: QuizAccess;
  userData: User;
}

const Quiz: React.FC<QuizProps> = ({ quizAccess, userData }) => {
  const navigate = useNavigate();
  const [showResult, setShowResult] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingSubmission, setPendingSubmission] = useState<{
    score: number;
    questions: QuestionWithOptions[];
    answers: QuizAnswerState[];
    timeTaken: number;
  } | null>(null);
  const [quizState, setQuizState] = useState<{
    score: number;
    questions: QuestionWithOptions[];
    answers: QuizAnswerState[];
    timeTaken: number;
    passed: boolean;
    certificateUrl?: string;
  } | null>(null);

  const handleQuizComplete = async (
    score: number,
    questions: QuestionWithOptions[],
    answers: QuizAnswerState[],
    timeTaken: number
  ) => {
    // Check for unanswered questions
    const unansweredCount = questions.length - answers.filter(a => a?.selectedIndices.length > 0).length;
    if (unansweredCount > 0) {
      toast.warning(
        `You have ${unansweredCount} unanswered question${unansweredCount > 1 ? 's' : ''}. Are you sure you want to submit?`,
        { autoClose: 5000 }
      );
    }

    setPendingSubmission({ score, questions, answers, timeTaken });
    setShowConfirmDialog(true);
  };

  const handleConfirmSubmit = async () => {
    if (!pendingSubmission) return;

    const { score, questions, answers, timeTaken } = pendingSubmission;

    try {
      // Submit quiz results
      const result = await quizService.submitQuiz({
        quiz_id: quizAccess.quiz_id,
        quiz_type: quizAccess.quiz_type,
        ldap: userData.ldap,
        supervisor: userData.supervisor,
        market: userData.market,
        score,
        answers,
        time_taken: timeTaken,
      });

      // Store quiz results
      const passed = result.score_text === 'PASS';
      setQuizState({
        score,
        questions,
        answers,
        timeTaken,
        passed,
        certificateUrl: result.pdf_url,
      });

      // Show completion message
      toast.success(
        passed 
          ? 'Congratulations! You have passed the quiz!' 
          : 'Quiz completed. Keep studying and try again.',
        { autoClose: 5000 }
      );

      // Show the results
      setShowResult(true);
    } catch (err) {
      console.error('Error submitting quiz:', err);
      toast.error('Failed to submit quiz results');
      navigate('/error', { 
        state: { 
          message: 'Failed to submit quiz results',
          error: err instanceof Error ? err.message : String(err)
        } 
      });
    } finally {
      setShowConfirmDialog(false);
      setPendingSubmission(null);
    }
  };

  const handleCancelSubmit = () => {
    setShowConfirmDialog(false);
    setPendingSubmission(null);
  };

  if (showResult && quizState) {
    return (
      <QuizResult
        questions={quizState.questions}
        answers={quizState.answers}
        score={quizState.score}
        timeTaken={quizState.timeTaken}
        passed={quizState.passed}
        certificateUrl={quizState.certificateUrl}
      />
    );
  }

  return (
    <>
      <QuizContent
        quizAccess={quizAccess}
        onComplete={handleQuizComplete}
      />
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={handleCancelSubmit}
        onConfirm={handleConfirmSubmit}
        title="Submit Quiz"
        message="Are you sure you want to submit your quiz? You cannot make changes after submission."
        confirmText="Submit Quiz"
        cancelText="Continue Quiz"
      />
    </>
  );
};

export default Quiz;
