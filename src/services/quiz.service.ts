import { supabase } from '../config/supabase';
import {
  QuizAccess,
  QuizResult,
  SubmitQuizParams,
  QuestionRecord,
  QuestionWithOptions,
} from '../types';

class QuizService {
  async validateQuizAccess(token: string): Promise<QuizAccess | null> {
    const { data, error } = await supabase
      .from('quiz_access')
      .select('*')
      .eq('token', token)
      .single();

    if (error) {
      console.error('Error validating quiz access:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    // Validate expiration and usage
    const now = new Date();
    const expiration = new Date(data.expiration);
    if (now > expiration || data.used_at) {
      return null;
    }

    return data;
  }

  async getQuizQuestions(quizId: string): Promise<QuestionWithOptions[]> {
    const { data: rawData, error } = await supabase.rpc('get_quiz_questions', {
      quiz_id: quizId,
    });

    if (error) {
      console.error('Error fetching quiz questions:', error);
      throw new Error('Failed to fetch quiz questions');
    }

    const records = rawData as QuestionRecord[];

    return records.map(record => ({
      id: record.questions.id,
      content: record.questions.content,
      question: record.questions.content, // Legacy field mapping
      type: record.questions.type,
      explanation: record.questions.explanation,
      difficulty_level: record.questions.difficulty_level,
      category: record.questions.category,
      tags: record.questions.tags,
      display_order: record.display_order,
      options: record.questions.options.sort((a, b) => a.display_order - b.display_order),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
  }

  async submitQuiz(params: SubmitQuizParams): Promise<QuizResult> {
    // Mark quiz access as used
    const { error: updateError } = await supabase
      .from('quiz_access')
      .update({ used_at: new Date().toISOString() })
      .eq('quiz_id', params.quiz_id);

    if (updateError) {
      console.error('Error marking quiz access as used:', updateError);
    }

    // Calculate score text
    const score_text = params.score >= 80 ? 'PASS' : 'FAIL';

    // Generate PDF certificate for passing scores
    let pdf_url: string | undefined;
    if (score_text === 'PASS') {
      try {
        pdf_url = await this.generateCertificatePDF();
      } catch (err) {
        console.error('Error generating certificate:', err);
      }
    }

    // Submit quiz result
    const { data, error } = await supabase
      .from('quiz_results')
      .insert([
        {
          quiz_id: params.quiz_id,
          quiz_type: params.quiz_type,
          ldap: params.ldap || 'Anonymous',
          supervisor: params.supervisor || 'Unknown',
          market: params.market || 'Unknown',
          score_value: params.score,
          score_text,
          answers: params.answers,
          time_taken: params.time_taken,
          completed_at: new Date().toISOString(),
          pdf_url,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error submitting quiz result:', error);
      throw new Error('Failed to submit quiz result');
    }

    return data;
  }

  private generateCertificatePDF(): Promise<string> {
    // This is a placeholder for PDF generation logic
    // In a real implementation, this would generate a PDF certificate
    // and upload it to storage, returning the URL
    const certificateId = this.generateToken();
    return Promise.resolve(`https://storage.example.com/certificates/${certificateId}.pdf`);
  }

  private generateToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from(crypto.getRandomValues(new Uint8Array(8)))
      .map(byte => chars[byte % chars.length])
      .join('');
  }
}

export const quizService = new QuizService();
