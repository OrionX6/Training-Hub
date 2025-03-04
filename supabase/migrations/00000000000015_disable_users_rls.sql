-- Disable Row Level Security for the users table
-- This is a temporary solution to fix the "infinite recursion detected in policy for relation 'users'" error

-- First, drop all policies on the users table
DROP POLICY IF EXISTS users_select_policy ON public.users;
DROP POLICY IF EXISTS users_insert_policy ON public.users;
DROP POLICY IF EXISTS users_update_policy ON public.users;
DROP POLICY IF EXISTS users_delete_policy ON public.users;

-- Disable RLS on the users table
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Grant proper permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO service_role;
