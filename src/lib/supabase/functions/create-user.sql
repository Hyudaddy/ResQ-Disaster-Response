-- Drop the existing function first
drop function if exists create_user(text, text, text, text, text, text);

-- Create a function to handle profile creation
create or replace function create_user(
  p_user_id uuid,
  p_email text,
  p_full_name text,
  p_user_role text,
  p_department text,
  p_jurisdiction text
) returns uuid
language plpgsql
security definer
as $$
begin
  -- Check if the current user is an admin
  if not exists (
    select 1 from profiles
    where id = auth.uid()
    and role = 'admin'
  ) then
    raise exception 'Only admins can create users';
  end if;

  -- Validate role-specific requirements
  if (p_user_role = 'responder' or p_user_role = 'admin') and (p_department is null or p_jurisdiction is null) then
    raise exception 'Department and jurisdiction are required for responder and admin roles';
  end if;

  -- Insert or update profile
  insert into profiles (
    id,
    email,
    full_name,
    role,
    department,
    jurisdiction
  ) values (
    p_user_id,
    p_email,
    p_full_name,
    p_user_role,
    case 
      when p_user_role in ('responder', 'admin') then p_department
      else null
    end,
    case 
      when p_user_role in ('responder', 'admin') then p_jurisdiction
      else null
    end
  )
  on conflict (id) do update
  set
    email = p_email,
    full_name = p_full_name,
    role = p_user_role,
    department = case 
      when p_user_role in ('responder', 'admin') then p_department
      else null
    end,
    jurisdiction = case 
      when p_user_role in ('responder', 'admin') then p_jurisdiction
      else null
    end;

  return p_user_id;
end;
$$; 