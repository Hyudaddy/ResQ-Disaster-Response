-- Create storage bucket for incident images if it doesn't exist
insert into storage.buckets (id, name, public)
values ('incident-images', 'incident-images', true)
on conflict (id) do nothing;

-- First, drop the existing check constraint if it exists
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Update existing profiles to match the new constraint
UPDATE profiles
SET role = 'citizen'
WHERE role = 'public';

-- Create a function to validate profile data
CREATE OR REPLACE FUNCTION validate_profile_role()
RETURNS TRIGGER AS $$
BEGIN
  IF (NEW.role = 'citizen' AND NEW.department IS NULL AND NEW.jurisdiction IS NULL) OR
     (NEW.role IN ('responder', 'admin') AND NEW.department IS NOT NULL AND NEW.jurisdiction IS NOT NULL) THEN
    RETURN NEW;
  ELSE
    RAISE EXCEPTION 'Invalid role configuration: citizen users must have no department/jurisdiction, while responder/admin users must have both';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to validate profile data before insert or update
DROP TRIGGER IF EXISTS validate_profile_role_trigger ON profiles;
CREATE TRIGGER validate_profile_role_trigger
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION validate_profile_role();

-- Add missing foreign key constraints
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_incident_type') THEN
    ALTER TABLE public.incidents
      ADD CONSTRAINT fk_incident_type
      FOREIGN KEY (type_id)
      REFERENCES public.incident_types(id)
      ON DELETE RESTRICT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_incident_location') THEN
    ALTER TABLE public.incidents
      ADD CONSTRAINT fk_incident_location
      FOREIGN KEY (location_id)
      REFERENCES public.locations(id)
      ON DELETE RESTRICT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_incident_reporter') THEN
    ALTER TABLE public.incidents
      ADD CONSTRAINT fk_incident_reporter
      FOREIGN KEY (reporter_id)
      REFERENCES public.profiles(id)
      ON DELETE RESTRICT;
  END IF;
END $$;

-- Insert default incident types if they don't exist
INSERT INTO public.incident_types (name, description, icon)
SELECT 'fire', 'Fire incidents including structural fires, wildfires, and vehicle fires', 'flame'
WHERE NOT EXISTS (SELECT 1 FROM public.incident_types WHERE name = 'fire');

INSERT INTO public.incident_types (name, description, icon)
SELECT 'flood', 'Flood incidents including flash floods, river floods, and urban flooding', 'droplet'
WHERE NOT EXISTS (SELECT 1 FROM public.incident_types WHERE name = 'flood');

INSERT INTO public.incident_types (name, description, icon)
SELECT 'earthquake', 'Earthquake incidents and seismic activities', 'waves'
WHERE NOT EXISTS (SELECT 1 FROM public.incident_types WHERE name = 'earthquake');

INSERT INTO public.incident_types (name, description, icon)
SELECT 'storm', 'Storm incidents including typhoons, hurricanes, and severe weather', 'wind'
WHERE NOT EXISTS (SELECT 1 FROM public.incident_types WHERE name = 'storm');

INSERT INTO public.incident_types (name, description, icon)
SELECT 'medical', 'Medical emergencies requiring emergency medical services', 'heart'
WHERE NOT EXISTS (SELECT 1 FROM public.incident_types WHERE name = 'medical');

INSERT INTO public.incident_types (name, description, icon)
SELECT 'infrastructure', 'Infrastructure damage and utility failures', 'construction'
WHERE NOT EXISTS (SELECT 1 FROM public.incident_types WHERE name = 'infrastructure');

INSERT INTO public.incident_types (name, description, icon)
SELECT 'other', 'Other types of incidents not covered by the above categories', 'alert-circle'
WHERE NOT EXISTS (SELECT 1 FROM public.incident_types WHERE name = 'other');

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_responders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_resources ENABLE ROW LEVEL SECURITY;

-- Create or replace policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
CREATE POLICY "Admins can manage all profiles"
  ON public.profiles FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- Add policy for admin profile creation
DROP POLICY IF EXISTS "Admins can create profiles for new users" ON public.profiles;
CREATE POLICY "Admins can create profiles for new users"
  ON public.profiles FOR INSERT
  WITH CHECK (
    auth.jwt() ->> 'role' = 'admin' AND
    (
      (role = 'citizen' AND department IS NULL AND jurisdiction IS NULL) OR
      (role IN ('responder', 'admin') AND department IS NOT NULL AND jurisdiction IS NOT NULL)
    )
  );

-- Incident types policies
DROP POLICY IF EXISTS "Incident types are viewable by everyone" ON public.incident_types;
CREATE POLICY "Incident types are viewable by everyone"
  ON public.incident_types FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Only admins can manage incident types" ON public.incident_types;
CREATE POLICY "Only admins can manage incident types"
  ON public.incident_types FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- Locations policies
DROP POLICY IF EXISTS "Locations are viewable by everyone" ON public.locations;
CREATE POLICY "Locations are viewable by everyone"
  ON public.locations FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can create locations" ON public.locations;
CREATE POLICY "Authenticated users can create locations"
  ON public.locations FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Only admins can update locations" ON public.locations;
CREATE POLICY "Only admins can update locations"
  ON public.locations FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'admin');

DROP POLICY IF EXISTS "Only admins can delete locations" ON public.locations;
CREATE POLICY "Only admins can delete locations"
  ON public.locations FOR DELETE
  USING (auth.jwt() ->> 'role' = 'admin');

-- Incident policies
DROP POLICY IF EXISTS "Incidents are viewable by everyone" ON public.incidents;
CREATE POLICY "Incidents are viewable by everyone"
  ON public.incidents FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can create incidents" ON public.incidents;
CREATE POLICY "Authenticated users can create incidents"
  ON public.incidents FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update their own incidents" ON public.incidents;
CREATE POLICY "Users can update their own incidents"
  ON public.incidents FOR UPDATE
  USING (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "Admins can update any incident" ON public.incidents;
CREATE POLICY "Admins can update any incident"
  ON public.incidents FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'admin');

-- Incident images policies
DROP POLICY IF EXISTS "Incident images are viewable by everyone" ON public.incident_images;
CREATE POLICY "Incident images are viewable by everyone"
  ON public.incident_images FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can upload incident images" ON public.incident_images;
CREATE POLICY "Authenticated users can upload incident images"
  ON public.incident_images FOR INSERT
  WITH CHECK (auth.uid() = uploaded_by);

DROP POLICY IF EXISTS "Users can delete their own incident images" ON public.incident_images;
CREATE POLICY "Users can delete their own incident images"
  ON public.incident_images FOR DELETE
  USING (auth.uid() = uploaded_by);

DROP POLICY IF EXISTS "Admins can manage all incident images" ON public.incident_images;
CREATE POLICY "Admins can manage all incident images"
  ON public.incident_images FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- Storage policies for incident images
DROP POLICY IF EXISTS "Incident images are publicly accessible" ON storage.objects;
CREATE POLICY "Incident images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'incident-images');

DROP POLICY IF EXISTS "Authenticated users can upload incident images" ON storage.objects;
CREATE POLICY "Authenticated users can upload incident images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'incident-images' AND
    auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "Users can delete their own incident images" ON storage.objects;
CREATE POLICY "Users can delete their own incident images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'incident-images' AND
    auth.uid() = owner
  );

DROP POLICY IF EXISTS "Admins can manage all incident images" ON storage.objects;
CREATE POLICY "Admins can manage all incident images"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'incident-images' AND
    auth.jwt() ->> 'role' = 'admin'
  ); 