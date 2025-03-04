-- Drop old tables and types if they exist
drop table if exists public.admins cascade;
drop type if exists public.question_type cascade;
drop type if exists public.difficulty_level cascade;

-- Create custom types
create type public.question_type as enum ('multiple_choice_single', 'multiple_choice_multiple', 'true_false', 'check_all_that_apply');
create type public.difficulty_level as enum ('easy', 'medium', 'hard');

-- Update users table
create table if not exists public.users (
    id uuid not null default gen_random_uuid(),
    email text not null,
    encrypted_password text not null,
    role text not null,
    password_change_required boolean not null default false,
    created_at timestamp with time zone not null default timezone('utc'::text, now()),
    updated_at timestamp with time zone not null default timezone('utc'::text, now()),
    constraint users_pkey primary key (id),
    constraint users_email_key unique (email),
    constraint users_role_check check (
        role = any (array['admin'::text, 'user'::text, 'super_admin'::text])
    )
);

-- Trigger for password validation
create or replace function public.enforce_password_policy()
returns trigger as $$
begin
    -- Check password requirements:
    -- At least 8 characters
    -- At least one uppercase letter
    -- At least one number
    -- At least one special character
    if length(new.encrypted_password) < 8 then
        raise exception 'Password must be at least 8 characters long';
    end if;
    
    if new.encrypted_password !~ '[A-Z]' then
        raise exception 'Password must contain at least one uppercase letter';
    end if;
    
    if new.encrypted_password !~ '[0-9]' then
        raise exception 'Password must contain at least one number';
    end if;
    
    if new.encrypted_password !~ '[!@#$%^&*(),.?":{}|<>]' then
        raise exception 'Password must contain at least one special character';
    end if;
    
    return new;
end;
$$ language plpgsql;

create trigger enforce_password_policy_trigger
    before insert or update
    on public.users
    for each row
    execute function public.enforce_password_policy();

-- Create initial super admin user
insert into public.users (email, encrypted_password, role) 
values ('nojs2115@yahoo.com', 'Password123!', 'super_admin')
on conflict (email) do update 
set role = 'super_admin',
    encrypted_password = 'Password123!',
    password_change_required = false;

-- Update RLS policies
alter table public.users enable row level security;

create policy "Users can view their own user data"
    on public.users for select
    using (auth.uid() = id);

create policy "Super admins can manage all users"
    on public.users for all
    using (
        exists (
            select 1 from public.users
            where id = auth.uid() and role = 'super_admin'
        )
    );

create policy "Admins can view all users"
    on public.users for select
    using (
        exists (
            select 1 from public.users
            where id = auth.uid() and role in ('admin', 'super_admin')
        )
    );
