-- Enable required extensions
create extension if not exists "uuid-ossp";

-- Create tables
create table public.study_guides (
    id uuid primary key default uuid_generate_v4(),
    title text not null,
    description text,
    category text not null,
    status text not null check (status in ('published', 'draft')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table public.quizzes (
    id uuid primary key default uuid_generate_v4(),
    title text not null,
    description text,
    time_limit integer not null, -- in seconds
    passing_score decimal not null,
    status text not null check (status in ('active', 'inactive', 'draft')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table public.questions (
    id uuid primary key default uuid_generate_v4(),
    content text not null,
    type text not null check (type in ('multiple_choice_single', 'multiple_choice_multiple', 'true_false')),
    explanation text,
    difficulty_level text not null check (difficulty_level in ('easy', 'medium', 'hard')),
    category text not null,
    tags text[] not null default '{}',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table public.question_options (
    id uuid primary key default uuid_generate_v4(),
    question_id uuid not null references public.questions(id) on delete cascade,
    option_text text not null,
    is_correct boolean not null,
    display_order integer not null,
    created_at timestamptz not null default now()
);

create table public.study_guide_questions (
    id uuid primary key default uuid_generate_v4(),
    study_guide_id uuid not null references public.study_guides(id) on delete cascade,
    question_id uuid not null references public.questions(id) on delete cascade,
    display_order integer not null,
    created_at timestamptz not null default now(),
    unique(study_guide_id, question_id)
);

create table public.quiz_questions (
    id uuid primary key default uuid_generate_v4(),
    quiz_id uuid not null references public.quizzes(id) on delete cascade,
    question_id uuid not null references public.questions(id) on delete cascade,
    display_order integer not null,
    created_at timestamptz not null default now(),
    unique(quiz_id, question_id)
);

create table public.admins (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null unique,
    created_at timestamptz not null default now()
);

create table public.quiz_access (
    id uuid primary key default uuid_generate_v4(),
    quiz_id uuid not null references public.quizzes(id),
    quiz_type text not null,
    access_type text not null check (access_type in ('token', 'user')),
    token text unique,
    user_id uuid,
    expiration timestamptz not null,
    used_at timestamptz,
    created_at timestamptz not null default now()
);

create table public.quiz_results (
    id uuid primary key default uuid_generate_v4(),
    quiz_type text not null,
    ldap text not null,
    supervisor text not null,
    market text not null,
    score_text text not null check (score_text in ('PASS', 'FAIL')),
    score_value decimal not null,
    time_taken integer not null, -- in seconds
    pdf_url text,
    completed_at timestamptz not null,
    created_at timestamptz not null default now()
);

-- Create indexes
create index study_guides_category_idx on public.study_guides(category);
create index questions_category_idx on public.questions(category);
create index quiz_access_token_idx on public.quiz_access(token) where token is not null;
create index quiz_access_user_id_idx on public.quiz_access(user_id) where user_id is not null;
create index quiz_results_ldap_idx on public.quiz_results(ldap);

-- Set up Row Level Security (RLS)
alter table public.study_guides enable row level security;
alter table public.quizzes enable row level security;
alter table public.questions enable row level security;
alter table public.question_options enable row level security;
alter table public.study_guide_questions enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.admins enable row level security;
alter table public.quiz_access enable row level security;
alter table public.quiz_results enable row level security;

-- Create policies
-- Study guides are publicly readable when published
drop policy if exists "Study guides are publicly readable when published" on public.study_guides;
create policy "Study guides are publicly readable when published"
    on public.study_guides for select
    using (status = 'published');

-- Enable anonymous access to study guides
alter table public.study_guides enable row level security;
create policy "Anonymous can read published study guides"
    on public.study_guides for select
    to anon
    using (status = 'published');

-- Admins can manage all content
create policy "Admins can manage all content"
    on public.study_guides for all
    using (
        exists (
            select 1 from public.admins
            where user_id = auth.uid()
        )
    );

-- Similar admin policies for other tables
create policy "Admins manage quizzes"
    on public.quizzes for all
    using (
        exists (
            select 1 from public.admins
            where user_id = auth.uid()
        )
    );

create policy "Admins manage questions"
    on public.questions for all
    using (
        exists (
            select 1 from public.admins
            where user_id = auth.uid()
        )
    );

-- Quiz access control
create policy "Users can view their quiz access"
    on public.quiz_access for select
    using (
        access_type = 'token' or
        (access_type = 'user' and user_id = auth.uid())
    );

create policy "Admins manage quiz access"
    on public.quiz_access for all
    using (
        exists (
            select 1 from public.admins
            where user_id = auth.uid()
        )
    );

-- Quiz results
create policy "Admins can view all results"
    on public.quiz_results for select
    using (
        exists (
            select 1 from public.admins
            where user_id = auth.uid()
        )
    );

create policy "Users can create quiz results"
    on public.quiz_results for insert
    with check (true);

-- Create functions and triggers for updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger handle_study_guides_updated_at
    before update on public.study_guides
    for each row
    execute function public.handle_updated_at();

create trigger handle_quizzes_updated_at
    before update on public.quizzes
    for each row
    execute function public.handle_updated_at();

create trigger handle_questions_updated_at
    before update on public.questions
    for each row
    execute function public.handle_updated_at();
