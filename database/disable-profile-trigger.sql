-- Disable the auto-create profile trigger
-- We'll handle profile creation manually in the admin API
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop the policy if it exists, then create it
DROP POLICY IF EXISTS "profiles_service_role_insert" ON profiles;

-- Add a permissive RLS policy for service_role to insert profiles
CREATE POLICY "profiles_service_role_insert"
ON profiles
FOR INSERT
TO service_role
WITH CHECK (true);
