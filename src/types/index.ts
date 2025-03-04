export type QuizType = 'default' | 'advanced' | 'phone';
export type QuestionType =
  | 'multiple_choice'
  | 'multiple_choice_multiple'
  | 'check_all_that_apply'
  | 'multiple_choice_single'
  | 'true_false';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type UserRole = 'user' | 'admin' | 'super_admin';
export type StudyGuideStatus = 'draft' | 'published' | 'archived';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  ldap?: string;
  supervisor?: string;
  market?: string;
  password_change_required: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserData {
  ldap: string | undefined;
  supervisor: string | undefined;
  market: string | undefined;
}

export interface QuizAccess {
  id: string;
  quiz_id: string;
  quiz_type: QuizType;
  token: string;
  expiration: string;
  access_type: 'token';
  created_at: string;
  used_at: string | null;
}

export interface Question {
  id: string;
  content: string;
  question?: string; // Legacy field, maps to content
  type: QuestionType;
  explanation: string;
  difficulty_level: DifficultyLevel;
  category: string;
  tags: string[];
  display_order: number;
  options?: QuestionOption[];
  created_at: string;
  updated_at: string;
}

export interface QuestionOption {
  id: string;
  question_id: string;
  option_text: string;
  is_correct: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface QuestionWithOptions extends Omit<Question, 'options'> {
  options: QuestionOption[];
}

export interface QuizAnswerState {
  questionIndex: number;
  selectedIndices: number[];
}

// Legacy type alias for backward compatibility
export type UserAnswer = QuizAnswerState;

export interface QuizResult {
  id: string;
  quiz_id: string;
  quiz_type: QuizType;
  ldap: string;
  supervisor: string;
  market: string;
  score_value: number;
  score_text: 'PASS' | 'FAIL';
  answers: QuizAnswerState[];
  time_taken: number;
  completed_at: string;
  pdf_url?: string; // Optional field for PDF certificate
}

export interface QuizResultFilters {
  startDate?: string;
  endDate?: string;
  ldap?: string;
  supervisor?: string;
  market?: string;
}

export interface PasswordValidation {
  hasMinLength: boolean;
  hasUpperCase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

export interface QuestionRecord {
  questions: {
    id: string;
    content: string;
    type: QuestionType;
    explanation: string;
    difficulty_level: DifficultyLevel;
    category: string;
    tags: string[];
    options: QuestionOption[];
  };
  display_order: number;
}

export interface SubmitQuizParams {
  quiz_id: string;
  quiz_type: QuizType;
  ldap: string | undefined;
  supervisor: string | undefined;
  market: string | undefined;
  score: number;
  answers: QuizAnswerState[];
  time_taken: number;
}

export interface StudyGuide {
  id: string;
  title: string;
  description: string;
  category: string;
  status: StudyGuideStatus;
  created_at: string;
  updated_at: string;
  questions?: Question[];
}

export interface StudyGuideQuestionResponse {
  study_guide_id: string;
  questions: Question[];
}
