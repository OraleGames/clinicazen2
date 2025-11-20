-- Fix RLS for frontend user registration
-- Allow users to insert their own profile during signup

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;

-- Create a new policy that allows authenticated users to insert their own profile
CREATE POLICY "profiles_insert_authenticated"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Also keep the anon policy for the signup flow (email confirmation not yet done)
CREATE POLICY "profiles_insert_anon"
ON profiles
FOR INSERT
TO anon
WITH CHECK (true);
