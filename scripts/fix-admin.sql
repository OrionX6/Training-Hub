-- Fix admin user data
DO $$
DECLARE
  user_id UUID;
BEGIN
  -- Get the user ID for nojs2115@yahoo.com
  SELECT id INTO user_id FROM auth.users WHERE email = 'nojs2115@yahoo.com';
  
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'User nojs2115@yahoo.com not found in auth.users';
  END IF;
  
  -- Update public.users table
  INSERT INTO public.users (
    id,
    email,
    role,
    password_change_required,
    created_at,
    updated_at
  ) VALUES (
    user_id,
    'nojs2115@yahoo.com',
    'super_admin',
    false,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    role = 'super_admin',
    updated_at = NOW(),
    password_change_required = false;
    
  -- Verify auth.users settings
  UPDATE auth.users 
  SET role = 'authenticated', 
      is_super_admin = true,
      updated_at = NOW()
  WHERE id = user_id;
  
  -- Output result
  RAISE NOTICE 'Updated user % as super_admin', user_id;
END $$;
