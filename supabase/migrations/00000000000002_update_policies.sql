-- Add policy for reading questions and options
create policy "Questions are readable through published study guides"
    on public.questions for select
    using (
        exists (
            select 1 from public.study_guide_questions sgq
            join public.study_guides sg on sg.id = sgq.study_guide_id
            where sgq.question_id = questions.id
            and sg.status = 'published'
        )
    );

create policy "Question options are readable through published study guides"
    on public.question_options for select
    using (
        exists (
            select 1 from public.study_guide_questions sgq
            join public.study_guides sg on sg.id = sgq.study_guide_id
            where sgq.question_id = question_options.question_id
            and sg.status = 'published'
        )
    );

create policy "Study guide questions are readable for published guides"
    on public.study_guide_questions for select
    using (
        exists (
            select 1 from public.study_guides sg
            where sg.id = study_guide_questions.study_guide_id
            and sg.status = 'published'
        )
    );

-- Create a helper function for getting study guide questions
create or replace function public.get_study_guide_questions(guide_id uuid)
returns table (
    display_order integer,
    questions jsonb
)
language plpgsql
security definer
set search_path = public
as $$
begin
    return query
    select 
        sgq.display_order,
        jsonb_build_object(
            'id', q.id,
            'content', q.content,
            'type', q.type,
            'explanation', q.explanation,
            'difficulty_level', q.difficulty_level,
            'category', q.category,
            'tags', q.tags,
            'created_at', q.created_at,
            'updated_at', q.updated_at,
            'question_options', (
                select jsonb_agg(
                    jsonb_build_object(
                        'id', qo.id,
                        'option_text', qo.option_text,
                        'is_correct', qo.is_correct,
                        'display_order', qo.display_order,
                        'created_at', qo.created_at
                    )
                )
                from public.question_options qo
                where qo.question_id = q.id
                order by qo.display_order
            )
        ) as questions
    from public.study_guide_questions sgq
    join public.questions q on q.id = sgq.question_id
    where sgq.study_guide_id = guide_id
    order by sgq.display_order;
end;
$$;

-- Grant access to the function
grant execute on function public.get_study_guide_questions to anon;
grant execute on function public.get_study_guide_questions to authenticated;
