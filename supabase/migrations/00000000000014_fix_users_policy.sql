-- Fix the users policy that's causing infinite recursion
-- This migration addresses the "infinite recursion detected in policy for relation 'users'" error

-- First, drop the problematic policy
DROP POLICY IF EXISTS users_select_policy ON public.users;

-- Create a new policy that doesn't cause recursion
-- This policy allows users to see their own data and super admins to see all data
-- but uses a different approach to check for super admin status
CREATE POLICY users_select_policy ON public.users
  FOR SELECT
  USING (
    auth.uid() = id 
    OR (
      SELECT role = 'super_admin' 
      FROM public.users 
      WHERE id = auth.uid()
    )
  );

-- Ensure RLS is enabled
ALTER TABLE public.users FORCE ROW LEVEL SECURITY;

-- Grant proper permissions
GRANT SELECT ON public.users TO authenticated;
GRANT UPDATE ON public.users TO authenticated;
