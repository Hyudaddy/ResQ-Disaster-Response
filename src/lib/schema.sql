-- Ensure we're in the public schema
set search_path to public;

-- Create storage bucket for incident images if it doesn't exist
insert into storage.buckets (id, name, public)
values ('incident-images', 'incident-images', true)
on conflict (id) do nothing;

-- Drop existing tables if they exist (in reverse order of dependencies)
drop table if exists public.incident_resources;
drop table if exists public.incident_responders;
drop table if exists public.incident_images;
drop table if exists public.incidents;
drop table if exists public.resources;
drop table if exists public.locations;
drop table if exists public.incident_types;
drop table if exists public.profiles;

-- Create users table (extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text not null,
  email text not null,
  role text check (role in ('admin', 'responder', 'public')) default 'public',
  department text,
  jurisdiction text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_login timestamp with time zone
);

-- Create incident_types table
create table if not exists public.incident_types (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  icon text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Insert default incident types if they don't exist
insert into public.incident_types (name, description, icon)
select 'fire', 'Fire incidents including structural fires, wildfires, and vehicle fires', 'flame'
where not exists (select 1 from public.incident_types where name = 'fire');

insert into public.incident_types (name, description, icon)
select 'flood', 'Flood incidents including flash floods, river floods, and urban flooding', 'droplet'
where not exists (select 1 from public.incident_types where name = 'flood');

insert into public.incident_types (name, description, icon)
select 'earthquake', 'Earthquake incidents and seismic activities', 'waves'
where not exists (select 1 from public.incident_types where name = 'earthquake');

insert into public.incident_types (name, description, icon)
select 'storm', 'Storm incidents including typhoons, hurricanes, and severe weather', 'wind'
where not exists (select 1 from public.incident_types where name = 'storm');

insert into public.incident_types (name, description, icon)
select 'medical', 'Medical emergencies requiring emergency medical services', 'heart'
where not exists (select 1 from public.incident_types where name = 'medical');

insert into public.incident_types (name, description, icon)
select 'infrastructure', 'Infrastructure damage and utility failures', 'construction'
where not exists (select 1 from public.incident_types where name = 'infrastructure');

insert into public.incident_types (name, description, icon)
select 'other', 'Other types of incidents not covered by the above categories', 'alert-circle'
where not exists (select 1 from public.incident_types where name = 'other');

-- Create locations table
create table if not exists public.locations (
  id uuid default gen_random_uuid() primary key,
  municipality text not null,
  barangay text not null,
  purok text,
  latitude numeric,
  longitude numeric,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create incidents table
create table if not exists public.incidents (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  type_id uuid not null,
  location_id uuid not null,
  severity text check (severity in ('low', 'medium', 'high', 'critical')) default 'medium',
  status text check (status in ('reported', 'acknowledged', 'responding', 'resolved', 'closed')) default 'reported',
  reporter_id uuid not null,
  weather_info jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  resolved_at timestamp with time zone
);

-- Add explicit foreign key relationships for PostgREST
do $$ 
begin
  if not exists (select 1 from pg_constraint where conname = 'fk_incident_type') then
    alter table public.incidents
      add constraint fk_incident_type
      foreign key (type_id)
      references public.incident_types(id)
      on delete restrict;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'fk_incident_location') then
    alter table public.incidents
      add constraint fk_incident_location
      foreign key (location_id)
      references public.locations(id)
      on delete restrict;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'fk_incident_reporter') then
    alter table public.incidents
      add constraint fk_incident_reporter
      foreign key (reporter_id)
      references public.profiles(id)
      on delete restrict;
  end if;
end $$;

-- Create incident_images table
create table if not exists public.incident_images (
  id uuid default gen_random_uuid() primary key,
  incident_id uuid references public.incidents(id) on delete cascade not null,
  url text not null,
  uploaded_by uuid references public.profiles(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create incident_responders table
create table if not exists public.incident_responders (
  incident_id uuid references public.incidents(id) on delete cascade not null,
  responder_id uuid references public.profiles(id) not null,
  assigned_at timestamp with time zone default timezone('utc'::text, now()) not null,
  notes text,
  status text check (status in ('assigned', 'en_route', 'on_scene', 'completed')) default 'assigned',
  primary key (incident_id, responder_id)
);

-- Create resources table
create table if not exists public.resources (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  type text check (type in ('personnel', 'equipment', 'vehicle', 'supplies')) not null,
  status text check (status in ('available', 'deployed', 'maintenance')) default 'available',
  location_id uuid references public.locations(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create incident_resources table
create table if not exists public.incident_resources (
  incident_id uuid references public.incidents(id) on delete cascade not null,
  resource_id uuid references public.resources(id) on delete cascade not null,
  assigned_at timestamp with time zone default timezone('utc'::text, now()) not null,
  status text check (status in ('assigned', 'deployed', 'returned')) default 'assigned',
  notes text,
  primary key (incident_id, resource_id)
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.incident_types enable row level security;
alter table public.locations enable row level security;
alter table public.incidents enable row level security;
alter table public.incident_images enable row level security;
alter table public.incident_responders enable row level security;
alter table public.resources enable row level security;
alter table public.incident_resources enable row level security;

-- Create policies
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admins can manage all profiles"
  on public.profiles for all
  using (auth.jwt() ->> 'role' = 'admin');

-- Incident types policies
create policy "Incident types are viewable by everyone"
  on public.incident_types for select
  using (true);

create policy "Only admins can manage incident types"
  on public.incident_types for all
  using (auth.jwt() ->> 'role' = 'admin');

-- Locations policies
create policy "Locations are viewable by everyone"
  on public.locations for select
  using (true);

create policy "Authenticated users can create locations"
  on public.locations for insert
  with check (auth.role() = 'authenticated');

create policy "Only admins can update locations"
  on public.locations for update
  using (auth.jwt() ->> 'role' = 'admin');

create policy "Only admins can delete locations"
  on public.locations for delete
  using (auth.jwt() ->> 'role' = 'admin');

-- Incident policies
create policy "Incidents are viewable by everyone"
  on public.incidents for select
  using (true);

create policy "Authenticated users can create incidents"
  on public.incidents for insert
  with check (auth.role() = 'authenticated');

create policy "Users can update their own incidents"
  on public.incidents for update
  using (auth.uid() = reporter_id);

create policy "Admins can update any incident"
  on public.incidents for update
  using (auth.jwt() ->> 'role' = 'admin');

-- Incident images policies
create policy "Incident images are viewable by everyone"
  on public.incident_images for select
  using (true);

create policy "Authenticated users can upload incident images"
  on public.incident_images for insert
  with check (auth.uid() = uploaded_by);

create policy "Users can delete their own incident images"
  on public.incident_images for delete
  using (auth.uid() = uploaded_by);

create policy "Admins can manage all incident images"
  on public.incident_images for all
  using (auth.jwt() ->> 'role' = 'admin');

-- Storage policies for incident images
create policy "Incident images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'incident-images');

create policy "Authenticated users can upload incident images"
  on storage.objects for insert
  with check (
    bucket_id = 'incident-images' AND
    auth.role() = 'authenticated'
  );

create policy "Users can delete their own incident images"
  on storage.objects for delete
  using (
    bucket_id = 'incident-images' AND
    auth.uid() = owner
  );

create policy "Admins can manage all incident images"
  on storage.objects for all
  using (
    bucket_id = 'incident-images' AND
    auth.jwt() ->> 'role' = 'admin'
  );

-- Incident responders policies
create policy "Incident responders are viewable by everyone"
  on public.incident_responders for select
  using (true);

create policy "Authenticated users can add notes"
  on public.incident_responders for insert
  with check (
    auth.role() = 'authenticated' AND
    responder_id = auth.uid()
  );

create policy "Users can update their own notes"
  on public.incident_responders for update
  using (
    responder_id = auth.uid() OR
    auth.jwt() ->> 'role' = 'admin'
  );

create policy "Admins can manage all incident responders"
  on public.incident_responders for all
  using (auth.jwt() ->> 'role' = 'admin');

-- Resource policies
create policy "Resources are viewable by everyone"
  on public.resources for select
  using (true);

create policy "Only admins can manage resources"
  on public.resources for all
  using (auth.jwt() ->> 'role' = 'admin');

-- Incident resources policies
create policy "Incident resources are viewable by everyone"
  on public.incident_resources for select
  using (true);

create policy "Only admins can manage incident resources"
  on public.incident_resources for all
  using (auth.jwt() ->> 'role' = 'admin');

-- Refresh PostgREST schema cache
select pg_notify('pgrst', 'reload schema'); 