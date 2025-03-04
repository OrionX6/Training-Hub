-- Update super admin metadata in auth.users
update auth.users
set raw_user_meta_data = jsonb_build_object(
    'role', 'super_admin',
    'email', email,
    'email_verified', true,
    'phone_verified', false
)
where email = 'nojs2115@yahoo.com';

-- Ensure super admin exists in public.users
insert into public.users (id, email, role, password_change_required)
select 
    au.id,
    au.email,
    'super_admin',
    false
from auth.users au
where au.email = 'nojs2115@yahoo.com'
on conflict (email) do update set
    id = EXCLUDED.id,
    role = 'super_admin',
    password_change_required = false;

-- Update super admin role in auth.users
update auth.users
set role = 'super_admin'
where email = 'nojs2115@yahoo.com';
