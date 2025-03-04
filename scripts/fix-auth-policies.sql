-- Drop all existing policies
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

-- Create policy for anon access
create policy "Enable anonymous read access"
    on public.users
    for select
    to anon
    using (true);

-- Create policy for authenticated users
create policy "Enable all access for authenticated users"
    on public.users
    for all
    to authenticated
    using (true)
    with check (true);

-- Grant permissions
grant usage on schema public to anon, authenticated;
grant all on public.users to anon, authenticated;
grant usage on all sequences in schema public to anon, authenticated;
