-- Update the super admin's metadata in auth.users
update auth.users
set 
    raw_user_meta_data = jsonb_build_object(
        'role', 'super_admin',
        'email', email,
        'email_verified', true
    ),
    email_confirmed_at = now(),
    updated_at = now()
where email = 'nojs2115@yahoo.com';

-- Update or create super admin in public.users
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

-- Verify changes
select 'auth.users' as table_name, 
       id, 
       email, 
       raw_user_meta_data->>'role' as role, 
       email_confirmed_at
from auth.users 
where email = 'nojs2115@yahoo.com'
union all
select 'public.users' as table_name,
       id,
       email,
       role,
       created_at
from public.users
where email = 'nojs2115@yahoo.com';
