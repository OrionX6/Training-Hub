import { createClient } from '@supabase/supabase-js';

if (!process.env.REACT_APP_SUPABASE_URL) {
  throw new Error('Missing REACT_APP_SUPABASE_URL');
}

if (!process.env.REACT_APP_SUPABASE_ANON_KEY) {
  throw new Error('Missing REACT_APP_SUPABASE_ANON_KEY');
}

export const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
export const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  db: {
    schema: 'public',
  },
});

// Type-safe bucket operations
export const uploadToBucket = async (
  bucketName: string,
  filePath: string,
  file: File,
  options?: {
    cacheControl?: string;
    contentType?: string;
    upsert?: boolean;
  }
) => {
  const { data, error } = await supabase.storage.from(bucketName).upload(filePath, file, {
    cacheControl: options?.cacheControl ?? '3600',
    contentType: options?.contentType,
    upsert: options?.upsert ?? false,
  });

  if (error) {
    console.error('Error uploading file:', error);
    throw error;
  }

  return data;
};

export const getPublicUrl = (bucketName: string, filePath: string) => {
  const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
  return data.publicUrl;
};

export const downloadFromBucket = async (bucketName: string, filePath: string) => {
  const { data, error } = await supabase.storage.from(bucketName).download(filePath);

  if (error) {
    console.error('Error downloading file:', error);
    throw error;
  }

  return data;
};

// Common config
export const appConfig = {
  title: process.env.REACT_APP_TITLE || 'Training Hub',
  description:
    process.env.REACT_APP_DESCRIPTION ||
    'Training program with study guides and admin-controlled quizzes',
  pdfBucket: process.env.REACT_APP_PDF_BUCKET || 'certificates',
  quizTimeLimit: Number(process.env.REACT_APP_QUIZ_TIME_LIMIT) || 1500,
  quizPassScore: Number(process.env.REACT_APP_QUIZ_PASS_SCORE) || 80,
};

// Error handler types
export type SupabaseError = {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
};

export const isSupabaseError = (error: any): error is SupabaseError => {
  return error && typeof error === 'object' && 'message' in error;
};

export const formatError = (error: unknown): string => {
  if (isSupabaseError(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
};
