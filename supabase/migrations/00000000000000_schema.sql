-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing triggers if they exist
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_modified') THEN
        DROP TRIGGER IF EXISTS update_users_modified ON public.users;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_study_guides_modified') THEN
        DROP TRIGGER IF EXISTS update_study_guides_modified ON public.study_guides;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_questions_modified') THEN
        DROP TRIGGER IF EXISTS update_questions_modified ON public.questions;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_quizzes_modified') THEN
        DROP TRIGGER IF EXISTS update_quizzes_modified ON public.quizzes;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    END IF;
END $$;

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS public.update_modified_column() CASCADE;
DROP FUNCTION IF EXISTS public.get_study_guide_questions(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.is_super_admin(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.assign_admin_role(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.revoke_admin_role(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_all_users() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Drop existing policies if they exist
DO $$ 
BEGIN
    -- Drop policies on study_guides if the table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'study_guides') THEN
        DROP POLICY IF EXISTS "Study guides are publicly readable" ON public.study_guides;
        DROP POLICY IF EXISTS "Anonymous can read published study guides" ON public.study_guides;
        DROP POLICY IF EXISTS "Admins can manage all content" ON public.study_guides;
    END IF;
    
    -- Drop policies on questions if the table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'questions') THEN
        DROP POLICY IF EXISTS "Questions are publicly readable" ON public.questions;
        DROP POLICY IF EXISTS "Admins can manage all questions" ON public.questions;
    END IF;
    
    -- Drop policies on question_options if the table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'question_options') THEN
        DROP POLICY IF EXISTS "Question options are publicly readable" ON public.question_options;
        DROP POLICY IF EXISTS "Admins can manage all question options" ON public.question_options;
    END IF;
    
    -- Drop policies on study_guide_questions if the table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'study_guide_questions') THEN
        DROP POLICY IF EXISTS "Study guide questions are publicly readable" ON public.study_guide_questions;
        DROP POLICY IF EXISTS "Admins can manage all study guide questions" ON public.study_guide_questions;
    END IF;
    
    -- Drop policies on quizzes if the table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'quizzes') THEN
        DROP POLICY IF EXISTS "Admins can manage all quizzes" ON public.quizzes;
    END IF;
    
    -- Drop policies on quiz_questions if the table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'quiz_questions') THEN
        DROP POLICY IF EXISTS "Admins can manage all quiz questions" ON public.quiz_questions;
    END IF;
    
    -- Drop policies on quiz_access if the table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'quiz_access') THEN
        DROP POLICY IF EXISTS "Admins can manage all quiz access" ON public.quiz_access;
    END IF;
    
    -- Drop policies on quiz_results if the table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'quiz_results') THEN
        DROP POLICY IF EXISTS "Admins can view all quiz results" ON public.quiz_results;
    END IF;
    
    -- Drop policies on quiz_answers if the table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'quiz_answers') THEN
        DROP POLICY IF EXISTS "Admins can view all quiz answers" ON public.quiz_answers;
    END IF;
    
    -- Drop policies on users if the table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
        DROP POLICY IF EXISTS "Super admins can manage all users" ON public.users;
        DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
        DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
    END IF;
END $$;

-- Drop existing tables if they exist (to avoid errors on re-run)
DROP TABLE IF EXISTS public.quiz_answers CASCADE;
DROP TABLE IF EXISTS public.quiz_results CASCADE;
DROP TABLE IF EXISTS public.quiz_access CASCADE;
DROP TABLE IF EXISTS public.quiz_questions CASCADE;
DROP TABLE IF EXISTS public.study_guide_questions CASCADE;
DROP TABLE IF EXISTS public.question_options CASCADE;
DROP TABLE IF EXISTS public.questions CASCADE;
DROP TABLE IF EXISTS public.quizzes CASCADE;
DROP TABLE IF EXISTS public.study_guides CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.roles CASCADE;
DROP TABLE IF EXISTS public.role_assignments CASCADE;
DROP TABLE IF EXISTS public.study_progress CASCADE;

-- Drop existing types if they exist (to avoid errors on re-run)
DROP TYPE IF EXISTS public.question_type CASCADE;
DROP TYPE IF EXISTS public.difficulty_level CASCADE;
DROP TYPE IF EXISTS public.user_role CASCADE;
DROP TYPE IF EXISTS public.study_guide_status CASCADE;

-- Create custom types
CREATE TYPE public.question_type AS ENUM (
  'multiple_choice',
  'multiple_choice_multiple',
  'check_all_that_apply',
  'multiple_choice_single',
  'true_false'
);

CREATE TYPE public.difficulty_level AS ENUM (
  'easy',
  'medium',
  'hard'
);

CREATE TYPE public.user_role AS ENUM (
  'user',
  'admin',
  'super_admin'
);

CREATE TYPE public.study_guide_status AS ENUM (
  'draft',
  'published',
  'archived'
);

-- Create the update_modified_column function
CREATE OR REPLACE FUNCTION public.update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create tables in order of dependencies

-- Study Guides table
CREATE TABLE public.study_guides (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  status text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT study_guides_pkey PRIMARY KEY (id),
  CONSTRAINT study_guides_status_check CHECK (
    status = ANY (ARRAY['published'::text, 'draft'::text])
  )
) TABLESPACE pg_default;

-- Questions table
CREATE TABLE public.questions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  content text NOT NULL,
  type public.question_type NOT NULL,
  explanation text NOT NULL,
  difficulty_level public.difficulty_level NOT NULL,
  category text NOT NULL,
  tags text[] NULL DEFAULT '{}'::text[],
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT questions_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

-- Question options table
CREATE TABLE public.question_options (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  question_id uuid NULL,
  option_text text NOT NULL,
  is_correct boolean NOT NULL,
  display_order integer NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT question_options_pkey PRIMARY KEY (id),
  CONSTRAINT question_options_question_id_display_order_key UNIQUE (question_id, display_order),
  CONSTRAINT question_options_question_id_fkey FOREIGN KEY (question_id) REFERENCES questions (id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- Study guide questions table
CREATE TABLE public.study_guide_questions (
  study_guide_id uuid NOT NULL,
  question_id uuid NOT NULL,
  display_order integer NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT study_guide_questions_pkey PRIMARY KEY (study_guide_id, question_id),
  CONSTRAINT study_guide_questions_study_guide_id_display_order_key UNIQUE (study_guide_id, display_order),
  CONSTRAINT study_guide_questions_question_id_fkey FOREIGN KEY (question_id) REFERENCES questions (id) ON DELETE CASCADE,
  CONSTRAINT study_guide_questions_study_guide_id_fkey FOREIGN KEY (study_guide_id) REFERENCES study_guides (id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- Quizzes table
CREATE TABLE public.quizzes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  time_limit integer NOT NULL,
  passing_score numeric NOT NULL,
  status text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT quizzes_pkey PRIMARY KEY (id),
  CONSTRAINT quizzes_status_check CHECK (
    status = ANY (ARRAY['active'::text, 'inactive'::text])
  )
) TABLESPACE pg_default;

-- Quiz questions table
CREATE TABLE public.quiz_questions (
  quiz_id uuid NOT NULL,
  question_id uuid NOT NULL,
  display_order integer NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT quiz_questions_pkey PRIMARY KEY (quiz_id, question_id),
  CONSTRAINT quiz_questions_quiz_id_display_order_key UNIQUE (quiz_id, display_order),
  CONSTRAINT quiz_questions_question_id_fkey FOREIGN KEY (question_id) REFERENCES questions (id) ON DELETE CASCADE,
  CONSTRAINT quiz_questions_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES quizzes (id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- Quiz access table
CREATE TABLE public.quiz_access (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  quiz_id uuid NULL,
  access_type text NOT NULL,
  token text NULL,
  user_id uuid NULL,
  expiration timestamp with time zone NOT NULL,
  used_at timestamp with time zone NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT quiz_access_pkey PRIMARY KEY (id),
  CONSTRAINT quiz_access_token_key UNIQUE (token),
  CONSTRAINT quiz_access_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES quizzes (id) ON DELETE CASCADE,
  CONSTRAINT quiz_access_access_type_check CHECK (
    access_type = ANY (ARRAY['token'::text, 'user'::text])
  ),
  CONSTRAINT token_or_user_not_null CHECK (
    (
      (access_type = 'token'::text)
      AND (token IS NOT NULL)
      AND (user_id IS NULL)
    )
    OR (
      (access_type = 'user'::text)
      AND (user_id IS NOT NULL)
      AND (token IS NULL)
    )
  )
) TABLESPACE pg_default;

-- Quiz results table
CREATE TABLE public.quiz_results (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  quiz_id uuid NULL,
  user_id uuid NULL,
  access_id uuid NULL,
  score numeric NOT NULL,
  time_taken integer NOT NULL,
  completed_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT quiz_results_pkey PRIMARY KEY (id),
  CONSTRAINT quiz_results_access_id_fkey FOREIGN KEY (access_id) REFERENCES quiz_access (id) ON DELETE SET NULL,
  CONSTRAINT quiz_results_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES quizzes (id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- Quiz answers table
CREATE TABLE public.quiz_answers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  quiz_result_id uuid NULL,
  question_id uuid NULL,
  selected_options uuid[] NOT NULL,
  is_correct boolean NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT quiz_answers_pkey PRIMARY KEY (id),
  CONSTRAINT quiz_answers_question_id_fkey FOREIGN KEY (question_id) REFERENCES questions (id) ON DELETE CASCADE,
  CONSTRAINT quiz_answers_quiz_result_id_fkey FOREIGN KEY (quiz_result_id) REFERENCES quiz_results (id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- Users table
CREATE TABLE public.users (
  id uuid NOT NULL,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'user'::text,
  password_change_required boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_email_key UNIQUE (email),
  CONSTRAINT users_role_check CHECK (
    role = ANY (ARRAY['user'::text, 'admin'::text, 'super_admin'::text])
  )
) TABLESPACE pg_default;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_quiz_results_completed_at ON public.quiz_results USING btree (completed_at) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_id ON public.quiz_results USING btree (user_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_study_guides_category ON public.study_guides USING btree (category) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_questions_category ON public.questions USING btree (category) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_quiz_access_token ON public.quiz_access USING btree (token) WHERE token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_quiz_access_user_id ON public.quiz_access USING btree (user_id) WHERE user_id IS NOT NULL;

-- Create triggers
CREATE TRIGGER update_users_modified
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_study_guides_modified
BEFORE UPDATE ON public.study_guides
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_questions_modified
BEFORE UPDATE ON public.questions
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_quizzes_modified
BEFORE UPDATE ON public.quizzes
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.study_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_guide_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies for public access to study guides
CREATE POLICY "Study guides are publicly readable"
ON public.study_guides FOR SELECT
USING (status = 'published');

CREATE POLICY "Anonymous can read published study guides"
ON public.study_guides FOR SELECT
TO anon
USING (status = 'published');

-- Create policies for public access to questions and options
CREATE POLICY "Questions are publicly readable"
ON public.questions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.study_guide_questions sgq
    JOIN public.study_guides sg ON sg.id = sgq.study_guide_id
    WHERE sgq.question_id = questions.id
    AND sg.status = 'published'
  )
);

CREATE POLICY "Question options are publicly readable"
ON public.question_options FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.study_guide_questions sgq
    JOIN public.study_guides sg ON sg.id = sgq.study_guide_id
    WHERE sgq.question_id = question_options.question_id
    AND sg.status = 'published'
  )
);

CREATE POLICY "Study guide questions are publicly readable"
ON public.study_guide_questions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.study_guides sg
    WHERE sg.id = study_guide_questions.study_guide_id
    AND sg.status = 'published'
  )
);

-- Admin policies
CREATE POLICY "Admins can manage all content"
ON public.study_guides FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND (role = 'admin' OR role = 'super_admin')
  )
);

CREATE POLICY "Admins can manage all questions"
ON public.questions FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND (role = 'admin' OR role = 'super_admin')
  )
);

CREATE POLICY "Admins can manage all question options"
ON public.question_options FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND (role = 'admin' OR role = 'super_admin')
  )
);

CREATE POLICY "Admins can manage all study guide questions"
ON public.study_guide_questions FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND (role = 'admin' OR role = 'super_admin')
  )
);

CREATE POLICY "Admins can manage all quizzes"
ON public.quizzes FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND (role = 'admin' OR role = 'super_admin')
  )
);

CREATE POLICY "Admins can manage all quiz questions"
ON public.quiz_questions FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND (role = 'admin' OR role = 'super_admin')
  )
);

CREATE POLICY "Admins can manage all quiz access"
ON public.quiz_access FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND (role = 'admin' OR role = 'super_admin')
  )
);

CREATE POLICY "Admins can view all quiz results"
ON public.quiz_results FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND (role = 'admin' OR role = 'super_admin')
  )
);

CREATE POLICY "Admins can view all quiz answers"
ON public.quiz_answers FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND (role = 'admin' OR role = 'super_admin')
  )
);

-- Super admin policies for user management
CREATE POLICY "Super admins can manage all users"
ON public.users FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role = 'super_admin'
  )
);

-- User policies
CREATE POLICY "Users can view their own data"
ON public.users FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
ON public.users FOR UPDATE
USING (auth.uid() = id);

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.study_guides TO anon, authenticated;
GRANT SELECT ON public.questions TO anon, authenticated;
GRANT SELECT ON public.question_options TO anon, authenticated;
GRANT SELECT ON public.study_guide_questions TO anon, authenticated;

-- Create functions for study guide access
CREATE OR REPLACE FUNCTION public.get_study_guide_questions(guide_id uuid)
RETURNS TABLE (
  display_order integer,
  questions jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sgq.display_order,
    jsonb_build_object(
      'id', q.id,
      'content', q.content,
      'type', q.type,
      'explanation', q.explanation,
      'difficulty_level', q.difficulty_level,
      'category', q.category,
      'tags', q.tags,
      'created_at', q.created_at,
      'updated_at', q.updated_at,
      'options', (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', qo.id,
            'option_text', qo.option_text,
            'is_correct', qo.is_correct,
            'display_order', qo.display_order,
            'created_at', qo.created_at
          )
        )
        FROM public.question_options qo
        WHERE qo.question_id = q.id
        ORDER BY qo.display_order
      )
    ) AS questions
  FROM public.study_guide_questions sgq
  JOIN public.questions q ON q.id = sgq.question_id
  JOIN public.study_guides sg ON sg.id = sgq.study_guide_id
  WHERE sgq.study_guide_id = guide_id
  AND sg.status = 'published'
  ORDER BY sgq.display_order;
END;
$$;

-- Grant execute permission to the function
GRANT EXECUTE ON FUNCTION public.get_study_guide_questions(uuid) TO anon, authenticated;

-- Function to check if a user is a super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = user_id AND role = 'super_admin'
  );
END;
$$;

-- Grant execute permission to the function
GRANT EXECUTE ON FUNCTION public.is_super_admin(uuid) TO authenticated;

-- Function to assign admin role to a user
CREATE OR REPLACE FUNCTION public.assign_admin_role(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_caller_super_admin boolean;
BEGIN
  -- Check if the caller is a super admin
  SELECT public.is_super_admin(auth.uid()) INTO is_caller_super_admin;
  
  IF NOT is_caller_super_admin THEN
    RAISE EXCEPTION 'Only super admins can assign admin roles';
  END IF;
  
  -- Update the user's role to admin
  UPDATE public.users
  SET role = 'admin'
  WHERE id = target_user_id;
  
  RETURN FOUND;
END;
$$;

-- Grant execute permission to the function
GRANT EXECUTE ON FUNCTION public.assign_admin_role(uuid) TO authenticated;

-- Function to revoke admin role from a user
CREATE OR REPLACE FUNCTION public.revoke_admin_role(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_caller_super_admin boolean;
  target_user_role text;
BEGIN
  -- Check if the caller is a super admin
  SELECT public.is_super_admin(auth.uid()) INTO is_caller_super_admin;
  
  IF NOT is_caller_super_admin THEN
    RAISE EXCEPTION 'Only super admins can revoke admin roles';
  END IF;
  
  -- Check if the target user is a super admin
  SELECT role INTO target_user_role FROM public.users WHERE id = target_user_id;
  
  IF target_user_role = 'super_admin' THEN
    RAISE EXCEPTION 'Cannot revoke super admin role';
  END IF;
  
  -- Update the user's role to regular user
  UPDATE public.users
  SET role = 'user'
  WHERE id = target_user_id AND role = 'admin';
  
  RETURN FOUND;
END;
$$;

-- Grant execute permission to the function
GRANT EXECUTE ON FUNCTION public.revoke_admin_role(uuid) TO authenticated;

-- Function to get all users with their roles (for super admins only)
CREATE OR REPLACE FUNCTION public.get_all_users()
RETURNS TABLE (
  id uuid,
  email text,
  role text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_caller_super_admin boolean;
BEGIN
  -- Check if the caller is a super admin
  SELECT public.is_super_admin(auth.uid()) INTO is_caller_super_admin;
  
  IF NOT is_caller_super_admin THEN
    RAISE EXCEPTION 'Only super admins can view all users';
  END IF;
  
  RETURN QUERY
  SELECT u.id, u.email, u.role, u.created_at, u.updated_at
  FROM public.users u
  ORDER BY u.created_at DESC;
END;
$$;

-- Grant execute permission to the function
GRANT EXECUTE ON FUNCTION public.get_all_users() TO authenticated;

-- Create a trigger to sync auth.users with public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (NEW.id, NEW.email, 'user')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
