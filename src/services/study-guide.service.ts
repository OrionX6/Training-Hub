import { supabase } from '../config/supabase';
import {
  QuestionWithOptions,
  StudyGuide,
  QuestionRecord,
  QuestionType,
  DifficultyLevel,
} from '../types';

interface QuestionResponseOption {
  id: string;
  option_text: string;
  is_correct: boolean;
  display_order: number;
  created_at: string;
}

interface QuestionResponse {
  id: string;
  content: string;
  type: string;
  explanation: string | null;
  difficulty_level: string;
  category: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  question_options: QuestionResponseOption[];
}

interface StudyGuideQuestionResponse {
  display_order: number;
  questions: QuestionResponse;
}

class StudyGuideService {
  async getStudyGuideById(id: string): Promise<StudyGuide> {
    console.log('Fetching study guide by ID:', id);
    const { data, error } = await supabase.from('study_guides').select('*').eq('id', id).single();

    if (error) {
      console.error('Error fetching study guide:', error);
      throw new Error('Failed to fetch study guide');
    }

    console.log('Study guide fetched successfully:', data);
    return data;
  }

  async getStudyGuideContent(guideId: string): Promise<QuestionWithOptions[]> {
    console.log('Fetching study guide content for ID:', guideId);
    const { data: rawData, error } = await supabase.rpc('get_study_guide_questions', {
      guide_id: guideId,
    });

    if (error) {
      console.error('Error fetching study guide content:', error);
      throw new Error('Failed to fetch study guide content');
    }

    if (!rawData) {
      console.log('No data returned for study guide content');
      return [];
    }

    console.log('Raw study guide content:', rawData);
    const records = rawData as QuestionRecord[];

    const mappedQuestions = records.map(record => ({
      id: record.questions.id,
      content: record.questions.content,
      question: record.questions.content,
      type: record.questions.type,
      explanation: record.questions.explanation || '',
      difficulty_level: record.questions.difficulty_level,
      category: record.questions.category,
      tags: record.questions.tags,
      display_order: record.display_order,
      options: record.questions.options.sort((a, b) => a.display_order - b.display_order),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    console.log('Mapped questions:', mappedQuestions);
    return mappedQuestions;
  }

  async submitProgress(guideId: string, questionId: string, isCorrect: boolean): Promise<void> {
    console.log('Submitting progress:', { guideId, questionId, isCorrect });
    const { error } = await supabase.from('study_progress').insert([
      {
        guide_id: guideId,
        question_id: questionId,
        is_correct: isCorrect,
      },
    ]);

    if (error) {
      console.error('Error submitting progress:', error);
      throw new Error('Failed to submit progress');
    }
    console.log('Progress submitted successfully');
  }

  async getStudyGuideCategories(guideId: string): Promise<string[]> {
    console.log('Fetching categories for guide:', guideId);
    const { data, error } = await supabase.rpc('get_study_guide_categories', {
      guide_id: guideId,
    });

    if (error) {
      console.error('Error fetching categories:', error);
      throw new Error('Failed to fetch categories');
    }

    console.log('Categories fetched:', data);
    return data;
  }

  async getStudyGuidesByCategory(_category: string): Promise<StudyGuide[]> {
    console.log('Fetching study guides for category:', _category);
    const { data, error } = await supabase
      .from('study_guides')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching study guides by category:', error);
      throw new Error('Failed to fetch study guides');
    }

    console.log('Study guides fetched:', data);
    return data;
  }

  async getQuestionsByCategory(guideId: string, _category: string): Promise<QuestionWithOptions[]> {
    try {
      console.log('Fetching questions for guide:', guideId);
      
      // Get the study guide questions with their display order
      const { data: guideQuestions, error: guideError } = await supabase
        .from('study_guide_questions')
        .select('question_id, display_order')
        .eq('study_guide_id', guideId)
        .order('display_order');

      if (guideError) {
        throw new Error('Failed to fetch study guide questions');
      }

      if (!guideQuestions?.length) {
        return [];
      }

      // Get the questions and their options in a single query
      const questionIds = guideQuestions.map(q => q.question_id);
      const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select(`
          id,
          content,
          type,
          explanation,
          difficulty_level,
          category,
          tags,
          created_at,
          updated_at,
          question_options (*)
        `)
        .in('id', questionIds);

      if (questionsError) {
        throw new Error('Failed to fetch question details');
      }

      // Create a map for quick lookup of display orders
      const displayOrderMap = new Map(guideQuestions.map(q => [q.question_id, q.display_order]));

      // Map the questions to the expected format
      const mappedQuestions = questions.map(question => ({
        id: question.id,
        content: question.content,
        question: question.content,
        type: question.type as QuestionType,
        explanation: question.explanation || '',
        difficulty_level: question.difficulty_level as DifficultyLevel,
        category: question.category,
        tags: question.tags,
        display_order: displayOrderMap.get(question.id) || 0,
        options: (question.question_options || [])
          .sort((a, b) => a.display_order - b.display_order)
          .map(option => ({
            id: option.id,
            question_id: question.id,
            option_text: option.option_text,
            is_correct: option.is_correct,
            display_order: option.display_order,
            created_at: option.created_at,
            updated_at: option.created_at,
          })),
        created_at: question.created_at,
        updated_at: question.updated_at,
      }));

      // Sort by display order
      mappedQuestions.sort((a, b) => a.display_order - b.display_order);

      return mappedQuestions;
    } catch (error) {
      console.error('Error in getQuestionsByCategory:', error);
      throw error;
    }
  }

  async getStudyGuides(): Promise<StudyGuide[]> {
    console.log('Fetching all study guides');
    const { data, error } = await supabase
      .from('study_guides')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching study guides:', error);
      throw new Error('Failed to fetch study guides');
    }

    console.log('Study guides fetched:', data);
    return data;
  }

  async createStudyGuide(guide: Partial<StudyGuide>): Promise<StudyGuide> {
    console.log('Creating study guide:', guide);
    const newGuide = {
      ...guide,
      status: guide.status || 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('study_guides')
      .insert([newGuide])
      .select()
      .single();

    if (error) {
      console.error('Error creating study guide:', error);
      throw new Error('Failed to create study guide');
    }

    console.log('Study guide created:', data);
    return data;
  }

  async updateStudyGuide(id: string, guide: Partial<StudyGuide>): Promise<StudyGuide> {
    console.log('Updating study guide:', id, guide);
    const updates = {
      ...guide,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('study_guides')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating study guide:', error);
      throw new Error('Failed to update study guide');
    }

    console.log('Study guide updated:', data);
    return data;
  }

  async deleteStudyGuide(id: string): Promise<void> {
    console.log('Deleting study guide:', id);
    const { error } = await supabase.from('study_guides').delete().eq('id', id);

    if (error) {
      console.error('Error deleting study guide:', error);
      throw new Error('Failed to delete study guide');
    }
    console.log('Study guide deleted successfully');
  }

  async getQuestionsByTags(guideId: string, tags: string[]): Promise<QuestionWithOptions[]> {
    console.log('Fetching questions by tags:', { guideId, tags });
    const { data: rawData, error } = await supabase.rpc('get_questions_by_tags', {
      guide_id: guideId,
      tag_names: tags,
    });

    if (error) {
      console.error('Error fetching questions by tags:', error);
      throw new Error('Failed to fetch questions');
    }

    if (!rawData) {
      console.log('No questions found for tags');
      return [];
    }

    console.log('Raw questions data:', rawData);
    const records = rawData as QuestionRecord[];

    const mappedQuestions = records.map(record => ({
      id: record.questions.id,
      content: record.questions.content,
      question: record.questions.content,
      type: record.questions.type,
      explanation: record.questions.explanation || '',
      difficulty_level: record.questions.difficulty_level,
      category: record.questions.category,
      tags: record.questions.tags,
      display_order: record.display_order,
      options: record.questions.options.sort((a, b) => a.display_order - b.display_order),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    console.log('Mapped questions:', mappedQuestions);
    return mappedQuestions;
  }
}

export const studyGuideService = new StudyGuideService();
