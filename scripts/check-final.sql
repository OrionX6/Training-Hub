-- 1. Check auth.users - confirm super admin exists and metadata
select 
    id,
    email,
    role,
    raw_user_meta_data,
    raw_app_meta_data,
    last_sign_in_at,
    email_confirmed_at
from auth.users 
where email = 'nojs2115@yahoo.com';

-- 2. Check public.users - confirm super admin record
select * 
from public.users
where email = 'nojs2115@yahoo.com';

-- 3. Check RLS status for users table
select 
    schemaname,
    tablename,
    hasindexes,
    hasrules,
    hastriggers,
    rowsecurity
from pg_tables
where tablename = 'users'
and schemaname = 'public';

-- 4. Check the policies
select 
    schemaname,
    tablename,
    policyname,
    permissive,
    cmd,
    roles::text,
    qual::text
from pg_policies 
where tablename = 'users'
and schemaname = 'public';

-- 5. Check granted privileges
select
    grantee::text,
    privilege_type
from information_schema.role_table_grants 
where table_name = 'users'
and table_schema = 'public'
order by grantee, privilege_type;
