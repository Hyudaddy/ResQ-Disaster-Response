-- Drop the existing function if it exists
drop function if exists delete_user(uuid);

-- Create a function to delete a user
create or replace function delete_user(user_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  is_admin boolean;
begin
  -- Check if the requesting user is an admin
  select exists (
    select 1 from profiles
    where id = auth.uid()
    and role = 'admin'
  ) into is_admin;

  if not is_admin then
    raise exception 'Only administrators can delete users';
  end if;

  -- Delete related records first
  -- Delete incident images
  delete from incident_images where incident_id in (
    select id from incidents where reporter_id = user_id
  );
  
  -- Delete incidents
  delete from incidents where reporter_id = user_id;
  
  -- Delete from profiles
  delete from profiles where id = user_id;
  
  -- Note: The actual auth user deletion needs to be handled by a service role
  -- This will be done through a separate API endpoint
end;
$$; 