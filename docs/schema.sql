-- Add department and jurisdiction columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS department TEXT,
ADD COLUMN IF NOT EXISTS jurisdiction TEXT;

-- Update existing profiles to have null values for new columns
UPDATE profiles
SET department = NULL,
    jurisdiction = NULL
WHERE department IS NULL;

-- Add check constraint to ensure department and jurisdiction are provided for responder and admin roles
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE profiles
ADD CONSTRAINT profiles_role_check 
CHECK (
  (role = 'public' AND department IS NULL AND jurisdiction IS NULL) OR
  (role IN ('responder', 'admin') AND department IS NOT NULL AND jurisdiction IS NOT NULL)
);

-- Add comment to explain the role-based requirements
COMMENT ON COLUMN profiles.department IS 'Required for responder and admin roles, null for public users';
COMMENT ON COLUMN profiles.jurisdiction IS 'Required for responder and admin roles, null for public users'; 