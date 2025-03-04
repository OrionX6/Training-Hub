-- First, disable RLS temporarily
alter table public.users disable row level security;

-- Drop everything and start fresh
drop table if exists public.users cascade;
drop function if exists update_modified_column cascade;
drop function if exists sync_user_role cascade;

-- Clear any existing policies
do $$ 
declare 
    pol record;
begin
    for pol in select policyname 
               from pg_policies 
               where tablename = 'users' 
                 and schemaname = 'public'
    loop
        execute format('drop policy if exists %I on public.users', pol.policyname);
    end loop;
end $$;

-- Create fresh users table
create table public.users (
    id uuid primary key,
    email text unique not null,
    role text not null default 'user',
    password_change_required boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Grant basic permissions
grant usage on schema public to anon, authenticated;
grant all on public.users to anon, authenticated;

-- Add single open policy
alter table public.users enable row level security;
create policy "Allow all access"
    on public.users
    for all
    using (true)
    with check (true);

-- Initialize admin from auth.users
insert into public.users (id, email, role, password_change_required)
select 
    id,
    email,
    'super_admin',
    false
from auth.users
where email = 'nojs2115@yahoo.com'
on conflict (email) do update set
    role = 'super_admin',
    password_change_required = false;
