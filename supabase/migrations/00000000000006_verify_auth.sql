-- Function to verify and fix auth setup
create or replace function verify_and_fix_auth()
returns text as $$
declare
  v_auth_user_id uuid;
  v_public_user_id uuid;
  v_message text;
begin
  -- Check if super admin exists in auth.users
  select id into v_auth_user_id
  from auth.users
  where email = 'nojs2115@yahoo.com';

  -- Check if super admin exists in public.users
  select id into v_public_user_id
  from public.users
  where email = 'nojs2115@yahoo.com';

  v_message := 'Auth verification results:' || chr(10);

  -- If user doesn't exist in auth.users, create them
  if v_auth_user_id is null then
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
    );
    v_message := v_message || '- Created auth.users record' || chr(10);
    
    -- Get the new ID
    select id into v_auth_user_id
    from auth.users
    where email = 'nojs2115@yahoo.com';
  else
    v_message := v_message || '- auth.users record exists' || chr(10);
    
    -- Update password if it exists
    update auth.users
    set encrypted_password = crypt('Password123!', gen_salt('bf')),
        raw_user_meta_data = '{"role": "super_admin"}'::jsonb,
        updated_at = now()
    where id = v_auth_user_id;
    v_message := v_message || '- Updated auth.users password' || chr(10);
  end if;

  -- If user doesn't exist in public.users, create them
  if v_public_user_id is null then
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
    v_message := v_message || '- Created public.users record' || chr(10);
  else
    -- Update public user to match auth user
    update public.users
    set id = v_auth_user_id,
        encrypted_password = crypt('Password123!', gen_salt('bf')),
        role = 'super_admin',
        password_change_required = false,
        updated_at = now()
    where email = 'nojs2115@yahoo.com';
    v_message := v_message || '- Updated public.users record' || chr(10);
  end if;

  -- Verify all auth hooks and triggers exist
  if not exists (select 1 from pg_trigger where tgname = 'on_auth_user_created') then
    create trigger on_auth_user_created
      after insert on auth.users
      for each row execute procedure handle_auth_user_created();
    v_message := v_message || '- Created missing auth trigger' || chr(10);
  else
    v_message := v_message || '- Auth trigger exists' || chr(10);
  end if;

  return v_message;
end;
$$ language plpgsql security definer;

-- Run the verification
select verify_and_fix_auth();

-- Verify the user exists and has correct roles
select 
  au.id as auth_user_id,
  au.email as auth_email,
  au.role as auth_role,
  au.raw_user_meta_data->>'role' as auth_meta_role,
  pu.id as public_user_id,
  pu.email as public_email,
  pu.role as public_role,
  case when au.id = pu.id then 'OK' else 'MISMATCH' end as id_status
from auth.users au
left join public.users pu on au.id = pu.id
where au.email = 'nojs2115@yahoo.com'
   or pu.email = 'nojs2115@yahoo.com';
