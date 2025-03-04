export type QuestionType = 'multiple_choice' | 'check_all_that_apply' | 'multiple_choice_single' | 'true_false' | 'multiple_choice_multiple';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export type UserRole = 'user' | 'admin' | 'super_admin';

export interface Question {
  id: string;
  content: string;
  type: QuestionType;
  explanation: string;
  difficulty_level: DifficultyLevel;
  category: string;
  tags: string[];
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
  updated_at?: string;
}

export interface QuestionRecord {
  display_order: number;
  questions: {
    id: string;
    content: string;
    type: QuestionType;
    explanation: string | null;
    difficulty_level: DifficultyLevel;
    category: string;
    tags: string[];
    created_at: string;
    updated_at: string;
    options: QuestionOption[];
  };
}

export interface QuestionWithOptions extends Omit<Question, 'explanation'> {
  display_order: number;
  options: QuestionOption[];
  question: string; // For backward compatibility
  explanation: string | null;
}

export interface StudyGuide {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'published' | 'draft' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface StudyProgress {
  id: string;
  guide_id: string;
  user_id: string;
  question_id: string;
  is_correct: boolean;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  password_change_required: boolean;
  created_at: string;
  updated_at: string;
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

export interface QuizResult {
  id: string;
  quiz_id: string;
  user_id: string;
  score: number;
  time_taken: number;
  completed_at: string;
  created_at: string;
}

export interface QuizAnswer {
  id: string;
  quiz_result_id: string;
  question_id: string;
  selected_options: string[];
  is_correct: boolean;
  created_at: string;
}

export interface QuizAccess {
  id: string;
  quiz_id: string;
  access_type: 'token' | 'user';
  quiz_type: string; // Type of quiz (e.g., 'certification', 'practice')
  token?: string;
  user_id?: string;
  expiration: string;
  used_at?: string;
  created_at: string;
}

export interface QuizAnswerState {
  question_id: string;
  selected_options: string[];
  selectedIndices: number[];
  is_correct?: boolean;
  attempts: number;
  questionIndex?: number; // For backward compatibility
}

export interface QuizResultFilters {
  timeRange?: 'today' | 'week' | 'month' | 'year' | 'all';
  category?: string;
  status?: 'passed' | 'failed' | 'all';
  username?: string;
}

export interface SubmitQuizParams {
  quiz_id: string;
  quiz_type?: string;
  ldap?: string;
  supervisor?: string;
  market?: string;
  answers: QuizAnswerState[];
  score: number; // Required when submitting final results
  time_taken: number;
  accessId?: string;
}
