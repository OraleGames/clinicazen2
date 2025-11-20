-- Fix RLS policy to allow trigger to insert profiles
-- The trigger runs with SECURITY DEFINER which bypasses RLS, 
-- but we need to ensure it can insert without auth context

-- Add a policy that allows inserts when there's no auth context (for trigger)
CREATE POLICY "profiles_insert_trigger"
ON profiles
FOR INSERT
WITH CHECK (true);

-- OR alternatively, make the trigger function run as postgres superuser
-- by ensuring SECURITY DEFINER is set and the function owner has proper permissions

-- Check if the function has proper permissions
DO $$ 
BEGIN
  -- Grant necessary permissions to the function owner
  GRANT INSERT ON profiles TO postgres;
  GRANT INSERT ON profiles TO authenticated;
  GRANT INSERT ON profiles TO anon;
  
  -- Ensure the trigger function is owned by postgres or a superuser
  ALTER FUNCTION public.handle_new_user() OWNER TO postgres;
END $$;
