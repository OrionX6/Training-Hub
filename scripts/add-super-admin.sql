-- First, update auth.users to ensure proper role and metadata
update auth.users
set 
    role = 'authenticated',
    raw_user_meta_data = jsonb_build_object(
        'role', 'super_admin',
        'email_verified', true
    ),
    raw_app_meta_data = jsonb_build_object(
        'provider', 'email',
        'providers', array['email']
    ),
    email_confirmed_at = now(),
    updated_at = now(),
    confirmation_sent_at = now()
where email = 'nojs2115@yahoo.com';

-- Then, ensure public.users record exists with correct role
insert into public.users (
    id,
    email,
    role,
    password_change_required,
    created_at,
    updated_at
)
select 
    id,
    email,
    'super_admin',
    false,
    now(),
    now()
from auth.users
where email = 'nojs2115@yahoo.com'
on conflict (email) do update set
    role = 'super_admin',
    password_change_required = false,
    updated_at = now();

-- Remove previous policies
drop policy if exists "Allow users to read their own data" on public.users;
drop policy if exists "Allow users to update their own data" on public.users;
drop policy if exists "Allow everyone to read super admin data" on public.users;

-- Create new policies
create policy "Enable read access to own user data"
    on public.users for select
    using (
        auth.uid() = id 
        or 
        exists (
            select 1 from public.users where id = auth.uid() and role = 'super_admin'
        )
    );

create policy "Enable update access to own user data"
    on public.users for update
    using (auth.uid() = id)
    with check (auth.uid() = id);

-- Verify the setup
select
    'auth.users' as source,
    id,
    email,
    role,
    raw_user_meta_data,
    raw_app_meta_data,
    email_confirmed_at
from auth.users
where email = 'nojs2115@yahoo.com'
union all
select
    'public.users' as source,
    id,
    email,
    role,
    null::jsonb,
    null::jsonb,
    created_at
from public.users
where email = 'nojs2115@yahoo.com';
