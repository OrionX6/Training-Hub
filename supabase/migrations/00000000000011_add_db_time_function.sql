-- Add a simple function to get the current database time
-- This is used to check database connectivity

-- Drop the function if it already exists
DROP FUNCTION IF EXISTS public.get_database_time();

-- Create the function
CREATE OR REPLACE FUNCTION public.get_database_time()
RETURNS TIMESTAMP WITH TIME ZONE
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT NOW();
$$;

-- Grant execute permission to all users
GRANT EXECUTE ON FUNCTION public.get_database_time() TO anon, authenticated;

COMMENT ON FUNCTION public.get_database_time() IS 'Returns the current database time. Used for connectivity checks.';
