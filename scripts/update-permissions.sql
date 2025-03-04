-- Revoke all privileges first to ensure clean slate
revoke all privileges on public.users from anon, authenticated;

-- Grant only necessary privileges
grant usage on schema public to anon, authenticated;

-- Anonymous users only need SELECT
grant select on public.users to anon;

-- Authenticated users need SELECT and UPDATE (for changing their own data)
grant select, update on public.users to authenticated;

-- Update RLS policies
drop policy if exists "Allow all access" on public.users;
drop policy if exists "Enable anonymous read access" on public.users;
drop policy if exists "Enable all access for authenticated users" on public.users;

-- Create specific policies
create policy "Allow users to read their own data"
    on public.users
    for select
    to authenticated
    using (auth.uid() = id);

create policy "Allow users to update their own data"
    on public.users
    for update
    to authenticated
    using (auth.uid() = id);

create policy "Allow everyone to read super admin data"
    on public.users
    for select
    using (role = 'super_admin');
