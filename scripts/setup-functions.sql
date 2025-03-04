-- Function to check if a schema exists
create or replace function public.check_schema_existence(schema_name text)
returns boolean
language plpgsql
security definer
as $$
begin
  return exists (
    select 1
    from information_schema.schemata
    where schema_name = $1
  );
end;
$$;

-- Function to get table information
create or replace function public.get_table_info(table_name text)
returns json
language plpgsql
security definer
as $$
declare
  result json;
begin
  select json_agg(
    json_build_object(
      'column_name', column_name,
      'data_type', data_type,
      'is_nullable', is_nullable
    )
  )
  from information_schema.columns
  where table_name = $1
  into result;
  return result;
end;
$$;

-- Function to list auth users (requires appropriate permissions)
create or replace function public.list_auth_users()
returns json
language plpgsql
security definer
as $$
declare
  result json;
begin
  select json_agg(
    json_build_object(
      'id', id,
      'email', email,
      'role', raw_user_meta_data->>'role'
    )
  )
  from auth.users
  into result;
  return result;
end;
$$;
