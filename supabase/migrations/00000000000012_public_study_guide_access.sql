-- Migration to update RLS policies to allow public access to study guides
-- This ensures study guides are accessible without requiring login

-- Drop existing RLS policies for study_guides table
DROP POLICY IF EXISTS "Study guides are viewable by authenticated users" ON public.study_guides;
DROP POLICY IF EXISTS "Study guides are editable by admins" ON public.study_guides;

-- Create new RLS policies for study_guides table
-- Allow public access to published study guides
CREATE POLICY "Published study guides are viewable by everyone" 
ON public.study_guides
FOR SELECT
USING (status = 'published');

-- Allow authenticated users to view all study guides
CREATE POLICY "All study guides are viewable by authenticated users" 
ON public.study_guides
FOR SELECT
USING (auth.role() = 'authenticated');

-- Allow admins to edit study guides
CREATE POLICY "Study guides are editable by admins" 
ON public.study_guides
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND (users.role = 'admin' OR users.role = 'super_admin')
  )
);

-- Drop existing RLS policies for questions table
DROP POLICY IF EXISTS "Questions are viewable by authenticated users" ON public.questions;
DROP POLICY IF EXISTS "Questions are editable by admins" ON public.questions;

-- Create new RLS policies for questions table
-- Allow public access to questions in published study guides
CREATE POLICY "Questions in published study guides are viewable by everyone" 
ON public.questions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.study_guide_questions sgq
    JOIN public.study_guides sg ON sgq.guide_id = sg.id
    WHERE sgq.question_id = questions.id
    AND sg.status = 'published'
  )
);

-- Allow authenticated users to view all questions
CREATE POLICY "All questions are viewable by authenticated users" 
ON public.questions
FOR SELECT
USING (auth.role() = 'authenticated');

-- Allow admins to edit questions
CREATE POLICY "Questions are editable by admins" 
ON public.questions
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND (users.role = 'admin' OR users.role = 'super_admin')
  )
);

-- Drop existing RLS policies for question_options table
DROP POLICY IF EXISTS "Question options are viewable by authenticated users" ON public.question_options;
DROP POLICY IF EXISTS "Question options are editable by admins" ON public.question_options;

-- Create new RLS policies for question_options table
-- Allow public access to options for questions in published study guides
CREATE POLICY "Options for questions in published study guides are viewable by everyone" 
ON public.question_options
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.questions q
    JOIN public.study_guide_questions sgq ON q.id = sgq.question_id
    JOIN public.study_guides sg ON sgq.guide_id = sg.id
    WHERE question_options.question_id = q.id
    AND sg.status = 'published'
  )
);

-- Allow authenticated users to view all question options
CREATE POLICY "All question options are viewable by authenticated users" 
ON public.question_options
FOR SELECT
USING (auth.role() = 'authenticated');

-- Allow admins to edit question options
CREATE POLICY "Question options are editable by admins" 
ON public.question_options
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND (users.role = 'admin' OR users.role = 'super_admin')
  )
);

-- Drop existing RLS policies for study_guide_questions table
DROP POLICY IF EXISTS "Study guide questions are viewable by authenticated users" ON public.study_guide_questions;
DROP POLICY IF EXISTS "Study guide questions are editable by admins" ON public.study_guide_questions;

-- Create new RLS policies for study_guide_questions table
-- Allow public access to study_guide_questions for published study guides
CREATE POLICY "Study guide questions for published guides are viewable by everyone" 
ON public.study_guide_questions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.study_guides sg
    WHERE study_guide_questions.guide_id = sg.id
    AND sg.status = 'published'
  )
);

-- Allow authenticated users to view all study guide questions
CREATE POLICY "All study guide questions are viewable by authenticated users" 
ON public.study_guide_questions
FOR SELECT
USING (auth.role() = 'authenticated');

-- Allow admins to edit study guide questions
CREATE POLICY "Study guide questions are editable by admins" 
ON public.study_guide_questions
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND (users.role = 'admin' OR users.role = 'super_admin')
  )
);

-- Enable RLS on all tables
ALTER TABLE public.study_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_guide_questions ENABLE ROW LEVEL SECURITY;
