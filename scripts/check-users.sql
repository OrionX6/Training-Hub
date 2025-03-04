-- Check users table structure
select 
    column_name, 
    data_type, 
    column_default,
    is_nullable
from information_schema.columns 
where table_name = 'users'
and table_schema = 'public'
order by ordinal_position;

-- Check RLS policies
select 
    schemaname,
    tablename,
    policyname,
    roles,
    cmd,
    qual
from pg_policies 
where tablename = 'users'
order by policyname;

-- Check auth.users data
select 
    au.id,
    au.email,
    au.role,
    au.raw_user_meta_data,
    au.last_sign_in_at
from auth.users au
where au.email = 'nojs2115@yahoo.com';

-- Check public.users data
select *
from public.users
where email = 'nojs2115@yahoo.com';

-- Check user permissions
select 
    grantee,
    table_schema,
    table_name,
    privilege_type
from information_schema.role_table_grants 
where table_name = 'users'
and table_schema = 'public'
order by grantee, privilege_type;
