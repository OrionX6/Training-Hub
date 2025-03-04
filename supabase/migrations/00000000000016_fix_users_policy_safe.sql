-- Fix the users policy that's causing infinite recursion
-- This migration addresses the "infinite recursion detected in policy for relation 'users'" error
-- while maintaining Row Level Security for proper security

-- First, drop all policies on the users table
DROP POLICY IF EXISTS users_select_policy ON public.users;
DROP POLICY IF EXISTS users_insert_policy ON public.users;
DROP POLICY IF EXISTS users_update_policy ON public.users;
DROP POLICY IF EXISTS users_delete_policy ON public.users;

-- Ensure RLS is enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create a new select policy that avoids recursion
-- This policy allows users to see their own data
-- and uses a direct role check for admin access
CREATE POLICY users_select_policy ON public.users
  FOR SELECT
  USING (
    -- Users can see their own data
    auth.uid() = id 
    OR 
    -- Super admins can see all data (using a direct check on the session claims)
    (SELECT COALESCE(
        (NULLIF(current_setting('request.jwt.claims', true)::json->>'role', '')::text = 'super_admin'),
        false
      )
    )
  );

-- Create an insert policy that allows only super admins to create users
CREATE POLICY users_insert_policy ON public.users
  FOR INSERT
  WITH CHECK (
    (SELECT COALESCE(
        (NULLIF(current_setting('request.jwt.claims', true)::json->>'role', '')::text = 'super_admin'),
        false
      )
    )
  );

-- Create an update policy that allows users to update their own data
-- and super admins to update any data
CREATE POLICY users_update_policy ON public.users
  FOR UPDATE
  USING (
    -- Users can update their own data
    auth.uid() = id 
    OR 
    -- Super admins can update all data
    (SELECT COALESCE(
        (NULLIF(current_setting('request.jwt.claims', true)::json->>'role', '')::text = 'super_admin'),
        false
      )
    )
  );

-- Create a delete policy that allows only super admins to delete users
CREATE POLICY users_delete_policy ON public.users
  FOR DELETE
  USING (
    (SELECT COALESCE(
        (NULLIF(current_setting('request.jwt.claims', true)::json->>'role', '')::text = 'super_admin'),
        false
      )
    )
  );

-- Grant proper permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO service_role;
