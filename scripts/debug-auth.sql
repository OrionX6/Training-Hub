-- Use this script in the Supabase SQL editor to debug auth issues

-- Check for the user in auth.users
select 
  id as auth_id,
  email,
  encrypted_password,
  email_confirmed_at,
  role,
  raw_user_meta_data
from auth.users 
where email = 'nojs2115@yahoo.com';

-- Check for the user in public.users
select *
from public.users
where email = 'nojs2115@yahoo.com';

-- Reset the password for the super admin user in auth.users
update auth.users
set 
  encrypted_password = crypt('Password123!', gen_salt('bf')),
  raw_user_meta_data = jsonb_set(
    coalesce(raw_user_meta_data, '{}'::jsonb),
    '{role}',
    '"super_admin"'
  ),
  updated_at = now(),
  email_confirmed_at = now()
where email = 'nojs2115@yahoo.com';

-- Reset the user in public.users table
update public.users
set
  encrypted_password = crypt('Password123!', gen_salt('bf')),
  role = 'super_admin',
  password_change_required = false,
  updated_at = now()
where email = 'nojs2115@yahoo.com';

-- If user doesn't exist in either table, create them:
do $$
declare
  v_auth_user_id uuid;
begin
  -- First check if user exists in auth.users
  if not exists (select 1 from auth.users where email = 'nojs2115@yahoo.com') then
    -- Create user in auth.users
    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    ) values (
      '00000000-0000-0000-0000-000000000000',
      uuid_generate_v4(),
      'authenticated',
      'authenticated',
      'nojs2115@yahoo.com',
      crypt('Password123!', gen_salt('bf')),
      now(),
      '{"provider": "email", "providers": ["email"]}'::jsonb,
      '{"role": "super_admin"}'::jsonb,
      now(),
      now()
    )
    returning id into v_auth_user_id;

    -- Create corresponding entry in public.users
    insert into public.users (
      id,
      email,
      encrypted_password,
      role,
      password_change_required
    ) values (
      v_auth_user_id,
      'nojs2115@yahoo.com',
      crypt('Password123!', gen_salt('bf')),
      'super_admin',
      false
    );
  end if;
end $$;

-- Verify RLS policies
select
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
where tablename = 'users';

-- Verify table permissions
select
  grantee,
  privilege_type
from information_schema.role_table_grants
where table_name = 'users'
  and table_schema = 'public';

-- Print final verification
select 'Auth verification complete. Check the results above for any issues.' as message;
