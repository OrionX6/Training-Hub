-- Create a trigger function to sync auth.users with public.users
create or replace function sync_users()
returns trigger as $$
begin
  -- For sign up/login
  if TG_OP = 'INSERT' then
    insert into public.users (
      id,
      email,
      encrypted_password,
      role,
      password_change_required
    )
    values (
      new.id,
      new.email,
      new.encrypted_password,
      'user',  -- default role
      true     -- require password change on first login
    )
    on conflict (id) do update set
      email = excluded.email,
      encrypted_password = excluded.encrypted_password,
      updated_at = now();

    return new;
  end if;

  -- For email/password updates
  if TG_OP = 'UPDATE' then
    update public.users
    set
      email = coalesce(new.email, users.email),
      encrypted_password = coalesce(new.encrypted_password, users.encrypted_password),
      updated_at = now()
    where id = new.id;

    return new;
  end if;

  -- For deletions
  if TG_OP = 'DELETE' then
    delete from public.users where id = old.id;
    return old;
  end if;

  return null;
end;
$$ language plpgsql security definer;

-- Drop existing trigger if it exists
drop trigger if exists sync_users_trigger on auth.users;

-- Create trigger for sync_users
create trigger sync_users_trigger
after insert or update or delete on auth.users
for each row
execute function sync_users();

-- Ensure the super admin exists in auth.users
-- Note: This assumes you've already created the user in auth.users via the Supabase UI or API
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

-- Grant necessary permissions
grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to authenticated;
grant all on all sequences in schema public to authenticated;

-- Update RLS policies
alter table public.users enable row level security;

drop policy if exists "Users can view their own data" on public.users;
create policy "Users can view their own data"
  on public.users
  for select
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

drop policy if exists "Admins can view all users" on public.users;
create policy "Admins can view all users"
  on public.users
  for select
  using (
    exists (
      select 1 from public.users
      where id = auth.uid()
      and role in ('admin', 'super_admin')
    )
  );
