-- Create a super admin user
-- This script creates a super admin user in the database
-- The super admin can assign admin roles to other users

-- First, check if the user already exists in auth.users
DO $$
DECLARE
  user_exists BOOLEAN;
  user_id UUID;
BEGIN
  -- Check if the user exists in auth.users
  SELECT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'admin@example.com'
  ) INTO user_exists;

  IF user_exists THEN
    -- Get the user ID
    SELECT id INTO user_id FROM auth.users WHERE email = 'admin@example.com';
    RAISE NOTICE 'User already exists with ID: %', user_id;
  ELSE
    -- Create the user in auth.users
    user_id := gen_random_uuid();
    
    INSERT INTO auth.users (
      id, 
      email,
      email_confirmed_at,
      created_at,
      updated_at,
      role,
      is_super_admin
    ) VALUES (
      user_id,
      'admin@example.com',
      NOW(),
      NOW(),
      NOW(),
      'authenticated',
      TRUE
    );
    
    -- Set the user's password (password is 'Admin123!')
    -- Note: In a production environment, use a more secure password
    INSERT INTO auth.users (
      id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      role,
      is_super_admin
    ) VALUES (
      user_id,
      'admin@example.com',
      crypt('Admin123!', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      'authenticated',
      TRUE
    )
    ON CONFLICT (id) DO UPDATE
    SET encrypted_password = crypt('Admin123!', gen_salt('bf'));
    
    RAISE NOTICE 'Created new user with ID: %', user_id;
  END IF;

  -- Now ensure the user exists in the public.users table with super_admin role
  INSERT INTO public.users (
    id,
    email,
    role,
    password_change_required,
    created_at,
    updated_at
  ) VALUES (
    user_id,
    'admin@example.com',
    'super_admin',
    TRUE,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    role = 'super_admin',
    updated_at = NOW();
    
  RAISE NOTICE 'User set as super_admin in public.users table';
END $$;

-- Output the super admin credentials
DO $$
BEGIN
  RAISE NOTICE '----------------------------------------';
  RAISE NOTICE 'Super Admin Account Created';
  RAISE NOTICE '----------------------------------------';
  RAISE NOTICE 'Email: admin@example.com';
  RAISE NOTICE 'Password: Admin123!';
  RAISE NOTICE '';
  RAISE NOTICE 'IMPORTANT: Change this password after first login!';
  RAISE NOTICE '----------------------------------------';
END $$;
