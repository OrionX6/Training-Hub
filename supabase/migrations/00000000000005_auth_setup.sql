-- First, let's ensure we have the auth schema and extensions
create extension if not exists "uuid-ossp";

-- Create the super admin user in auth.users first
insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) values (
  '00000000-0000-0000-0000-000000000000',  -- instance_id
  uuid_generate_v4(),                        -- id
  'authenticated',                           -- aud
  'authenticated',                           -- role
  'nojs2115@yahoo.com',                     -- email
  crypt('Password123!', gen_salt('bf')),    -- encrypted_password
  now(),                                    -- email_confirmed_at
  now(),                                    -- recovery_sent_at
  now(),                                    -- last_sign_in_at
  '{"provider": "email", "providers": ["email"]}',  -- raw_app_meta_data
  '{"role": "super_admin"}'::jsonb,         -- raw_user_meta_data
  now(),                                    -- created_at
  now(),                                    -- updated_at
  '',                                       -- confirmation_token
  '',                                       -- email_change
  '',                                       -- email_change_token_new
  ''                                        -- recovery_token
) on conflict (email) do update set
  encrypted_password = crypt('Password123!', gen_salt('bf')),
  raw_user_meta_data = '{"role": "super_admin"}'::jsonb,
  updated_at = now();

-- Now ensure the user exists in public.users table
insert into public.users (
  id,
  email,
  encrypted_password,
  role,
  password_change_required
)
select 
  id,
  email,
  encrypted_password,
  'super_admin',
  false
from auth.users
where email = 'nojs2115@yahoo.com'
on conflict (email) do update set
  role = 'super_admin',
  password_change_required = false;

-- Grant proper permissions
grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to authenticated;
grant all on all sequences in schema public to authenticated;

-- Enable RLS
alter table public.users enable row level security;

-- Update or create RLS policies
drop policy if exists "Users can view their own data" on public.users;
create policy "Users can view their own data"
  on public.users
  for all
  using (auth.uid() = id);

drop policy if exists "Super admins can manage all users" on public.users;
create policy "Super admins can manage all users"
  on public.users
  for all
  using (
    exists (
      select 1 from public.users
      where id = auth.uid()
      and role = 'super_admin'
    )
  );

-- Create auth trigger function if not exists
create or replace function handle_auth_user_created()
returns trigger as $$
begin
  insert into public.users (id, email, encrypted_password, role, password_change_required)
  values (new.id, new.email, new.encrypted_password, 'user', true);
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new auth users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_auth_user_created();
