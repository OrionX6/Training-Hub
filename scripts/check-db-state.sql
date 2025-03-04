-- Check table structure
select 
    column_name, 
    data_type, 
    is_nullable
from information_schema.columns 
where table_name = 'users'
and table_schema = 'public'
order by ordinal_position;

-- Check existing policies
select 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
from pg_policies 
where tablename = 'users';

-- Check users data
select 
    id,
    email,
    role,
    password_change_required,
    created_at
from public.users;

-- Check auth.users data
select 
    id,
    email,
    role,
    raw_user_meta_data,
    created_at
from auth.users;
