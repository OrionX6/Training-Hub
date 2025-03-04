import { supabase, checkDatabaseConnection } from '../config/supabase';
import {
  QuestionWithOptions,
  StudyGuide,
  QuestionRecord,
  QuestionType,
  DifficultyLevel,
} from '../types';

// Default/fallback data when database is unavailable
const fallbackStudyGuides: StudyGuide[] = [
  {
    id: 'default-guide-1',
    title: 'Service Tech Study Guide (Offline)',
    description: 'Service technician training materials (offline version)',
    category: 'service',
    status: 'published',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'default-guide-2',
    title: 'Phone Support Study Guide (Offline)',
    description: 'Phone support training materials (offline version)',
    category: 'phone',
    status: 'published',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

// Default/fallback questions when database is unavailable
const fallbackQuestions: QuestionWithOptions[] = [
  {
    id: 'default-question-1',
    content: 'This is a sample question (offline mode)',
    question: 'This is a sample question (offline mode)',
    type: 'multiple_choice',
    explanation: 'This is a sample explanation',
    difficulty_level: 'medium',
    category: 'service',
    tags: ['sample'],
    display_order: 1,
    options: [
      {
        id: 'option-1',
        question_id: 'default-question-1',
        option_text: 'Sample answer 1 (correct)',
        is_correct: true,
        display_order: 1,
        created_at: new Date().toISOString(),
      },
      {
        id: 'option-2',
        question_id: 'default-question-1',
        option_text: 'Sample answer 2',
        is_correct: false,
        display_order: 2,
        created_at: new Date().toISOString(),
      },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

class StudyGuideService {
  async getStudyGuideById(id: string): Promise<StudyGuide> {
    console.log('Fetching study guide by ID:', id);
    
    try {
      // Check database connection first
      const isConnected = await checkDatabaseConnection();
      if (!isConnected) {
        console.warn('Database unavailable, returning fallback guide');
        return fallbackStudyGuides.find(guide => guide.id === id) || fallbackStudyGuides[0];
      }
      
      const { data, error } = await supabase.from('study_guides').select('*').eq('id', id).single();

      if (error) {
        console.error('Error fetching study guide:', error);
        return fallbackStudyGuides[0];
      }

      console.log('Study guide fetched successfully:', data);
      return data;
    } catch (error) {
      console.error('Error in getStudyGuideById:', error);
      return fallbackStudyGuides[0];
    }
  }

  async getStudyGuideContent(guideId: string): Promise<QuestionWithOptions[]> {
    console.log('Fetching study guide content for ID:', guideId);
    
    try {
      // Check database connection first
      const isConnected = await checkDatabaseConnection();
      if (!isConnected) {
        console.warn('Database unavailable, returning fallback questions');
        return fallbackQuestions;
      }
      
      const { data: rawData, error } = await supabase.rpc('get_study_guide_questions', {
        guide_id: guideId,
      });

      if (error) {
        console.error('Error fetching study guide content:', error);
        return fallbackQuestions;
      }

      if (!rawData) {
        console.log('No data returned for study guide content');
        return fallbackQuestions;
      }

      const records = rawData as QuestionRecord[];
      return records.map(record => ({
        id: record.questions.id,
        content: record.questions.content,
        question: record.questions.content,
        type: record.questions.type as QuestionType,
        explanation: record.questions.explanation || '',
        difficulty_level: record.questions.difficulty_level as DifficultyLevel,
        category: record.questions.category,
        tags: record.questions.tags,
        display_order: record.display_order,
        options: record.questions.options.sort((a, b) => a.display_order - b.display_order),
        created_at: record.questions.created_at,
        updated_at: record.questions.updated_at,
      }));
    } catch (error) {
      console.error('Error in getStudyGuideContent:', error);
      return fallbackQuestions;
    }
  }

  async getQuestionsByCategory(guideId: string, category: string): Promise<QuestionWithOptions[]> {
    console.log('Fetching questions for guide:', guideId, 'category:', category);
    
    try {
      // Check database connection first
      const isConnected = await checkDatabaseConnection();
      if (!isConnected) {
        console.warn('Database unavailable, returning fallback questions');
        return fallbackQuestions;
      }
      
      // First try to get questions directly from the study guide content
      const allQuestions = await this.getStudyGuideContent(guideId);
      
      // Filter by category if specified
      if (category && category !== 'all') {
        return allQuestions.filter(q => q.category === category);
      }
      
      return allQuestions;
    } catch (error) {
      console.error('Error in getQuestionsByCategory:', error);
      return fallbackQuestions;
    }
  }

  async submitProgress(guideId: string, questionId: string, isCorrect: boolean): Promise<void> {
    console.log('Submitting progress:', { guideId, questionId, isCorrect });
    
    try {
      // Check database connection first
      const isConnected = await checkDatabaseConnection();
      if (!isConnected) {
        console.warn('Database unavailable, progress not saved');
        return;
      }
      
      const { error } = await supabase.from('study_progress').insert([
        {
          guide_id: guideId,
          question_id: questionId,
          is_correct: isCorrect,
        },
      ]);

      if (error) {
        console.error('Error submitting progress:', error);
      } else {
        console.log('Progress submitted successfully');
      }
    } catch (error) {
      console.error('Error in submitProgress:', error);
    }
  }

  async getStudyGuides(): Promise<StudyGuide[]> {
    console.log('Fetching all study guides');
    
    try {
      // Check database connection first
      const isConnected = await checkDatabaseConnection();
      if (!isConnected) {
        console.warn('Database unavailable, returning fallback guides');
        return fallbackStudyGuides;
      }
      
      const { data, error } = await supabase
        .from('study_guides')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching study guides:', error);
        return fallbackStudyGuides;
      }

      if (!data?.length) {
        return fallbackStudyGuides;
      }

      return data;
    } catch (error) {
      console.error('Error in getStudyGuides:', error);
      return fallbackStudyGuides;
    }
  }

  async getStudyGuidesByCategory(category: string): Promise<StudyGuide[]> {
    console.log('Fetching study guides for category:', category);
    
    try {
      // Check database connection first
      const isConnected = await checkDatabaseConnection();
      if (!isConnected) {
        console.warn('Database unavailable, returning fallback guides');
        return fallbackStudyGuides.filter(guide => guide.category === category);
      }
      
      const { data, error } = await supabase
        .from('study_guides')
        .select('*')
        .eq('status', 'published')
        .eq('category', category)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching study guides by category:', error);
        return fallbackStudyGuides.filter(guide => guide.category === category);
      }

      if (!data?.length) {
        return fallbackStudyGuides.filter(guide => guide.category === category);
      }

      return data;
    } catch (error) {
      console.error('Error in getStudyGuidesByCategory:', error);
      return fallbackStudyGuides.filter(guide => guide.category === category);
    }
  }

  // Admin-only methods - these will throw errors if database is not available
  // as they should only be accessed by authenticated admins

  async getAllStudyGuides(): Promise<StudyGuide[]> {
    const { data, error } = await supabase
      .from('study_guides')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all study guides:', error);
      throw error;
    }

    return data || [];
  }

  async createStudyGuide(guide: Partial<StudyGuide>): Promise<StudyGuide> {
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
      throw error;
    }

    return data;
  }

  async updateStudyGuide(id: string, guide: Partial<StudyGuide>): Promise<StudyGuide> {
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
      throw error;
    }

    return data;
  }

  async deleteStudyGuide(id: string): Promise<void> {
    const { error } = await supabase
      .from('study_guides')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting study guide:', error);
      throw error;
    }
  }
}

export const studyGuideService = new StudyGuideService();
