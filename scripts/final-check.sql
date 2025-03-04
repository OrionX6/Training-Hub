-- Check auth user
select
    'auth.users' as source,
    id,
    email,
    role,
    raw_user_meta_data,
    email_confirmed_at,
    created_at,
    updated_at
from auth.users
where email = 'nojs2115@yahoo.com';

-- Check public user
select
    'public.users' as source,
    id,
    email,
    role,
    password_change_required,
    created_at,
    updated_at
from public.users
where email = 'nojs2115@yahoo.com';

-- Check policies
select policyname, permissive, cmd, qual
from pg_policies
where tablename = 'users'
and schemaname = 'public'
order by policyname;
