-- Drop and recreate users table to ensure clean state
drop table if exists public.users cascade;

-- Create users table with minimal required fields
create table public.users (
    id uuid primary key,
    email text unique not null,
    role text not null default 'user',
    password_change_required boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint users_role_check check (role in ('user', 'admin', 'super_admin'))
);

-- Remove any existing policies
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

-- Enable RLS
alter table public.users enable row level security;

-- Create simple policies
create policy "Allow users to read own data"
    on public.users
    for select
    using (auth.uid() = id);

create policy "Allow users to update own password_change_required"
    on public.users
    for update
    using (auth.uid() = id);

create policy "Super admins can do everything"
    on public.users
    for all
    using (
        exists (
            select 1 
            from auth.users 
            where id = auth.uid() 
            and raw_user_meta_data->>'role' = 'super_admin'
        )
    );

-- Create trigger for updated_at
create or replace function update_modified_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger update_users_modified
    before update on public.users
    for each row
    execute procedure update_modified_column();

-- Initialize super admin in public.users
insert into public.users (id, email, role, password_change_required)
select 
    au.id,
    au.email,
    'super_admin',
    false
from auth.users au
where au.email = 'nojs2115@yahoo.com'
on conflict (email) do update set
    role = 'super_admin',
    password_change_required = false;

-- Grant necessary permissions
grant usage on schema public to anon, authenticated;
grant all on public.users to anon, authenticated;
grant usage on all sequences in schema public to anon, authenticated;
