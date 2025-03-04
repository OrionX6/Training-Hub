-- Fix authentication roles and permissions
-- This ensures proper role handling for super admin users

-- First, verify and clean up any inconsistent role assignments
DO $$
BEGIN
  -- Fix any inconsistencies between auth.users and public.users
  UPDATE public.users u
  SET role = 'super_admin'
  FROM auth.users au
  WHERE u.id = au.id
  AND au.is_super_admin = true
  AND u.role != 'super_admin';

  -- Set is_super_admin flag based on public.users role
  UPDATE auth.users au
  SET is_super_admin = true
  FROM public.users u
  WHERE au.id = u.id
  AND u.role = 'super_admin'
  AND au.is_super_admin = false;
END
$$;

-- Create or update policy for users table to allow reading own data and super admin access
DROP POLICY IF EXISTS users_select_policy ON public.users;
CREATE POLICY users_select_policy ON public.users
  FOR SELECT
  USING (
    auth.uid() = id 
    OR EXISTS (
      SELECT 1 FROM auth.users au 
      WHERE au.id = auth.uid() 
      AND au.is_super_admin = true
    )
  );

-- Ensure RLS is enabled
ALTER TABLE public.users FORCE ROW LEVEL SECURITY;

-- Grant proper permissions
GRANT SELECT ON public.users TO authenticated;
GRANT UPDATE ON public.users TO authenticated;

-- Create function to check super admin status
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM auth.users au
    INNER JOIN public.users u ON u.id = au.id
    WHERE au.id = auth.uid()
    AND u.role = 'super_admin'
    AND au.is_super_admin = true
  );
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;
