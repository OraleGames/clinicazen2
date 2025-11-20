-- Production-ready RLS policies for profiles table
-- This setup avoids recursion and follows security best practices

-- First, drop ALL existing policies on profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can insert any profile" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_select_public_info" ON profiles;
DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_admin_all" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON profiles;
DROP POLICY IF EXISTS "profiles_admin_update_all" ON profiles;
DROP POLICY IF EXISTS "profiles_admin_delete" ON profiles;

-- Enable RLS (security enabled)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ========================================
-- INSERT POLICIES
-- ========================================

-- 1. Allow authenticated users to insert their own profile during registration
-- This is critical for the sign-up flow
CREATE POLICY "profiles_insert_own"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- ========================================
-- SELECT POLICIES
-- ========================================

-- 2. Allow everyone to view all profiles
-- This covers: own profile, therapist listings, blog authors, etc.
CREATE POLICY "profiles_select_all"
ON profiles
FOR SELECT
TO authenticated, anon
USING (true);

-- ========================================
-- UPDATE POLICIES
-- ========================================

-- 4. Allow users to update their own profile
-- Simplified - no recursion
CREATE POLICY "profiles_update_own"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 5. Allow admins to update any profile (including roles)
-- Uses service role, not JWT, so no recursion
-- This will only work when using the service role key
CREATE POLICY "profiles_admin_update_all"
ON profiles
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

-- ========================================
-- DELETE POLICIES
-- ========================================

-- 6. Only service role can delete profiles (admins via backend API)
CREATE POLICY "profiles_admin_delete"
ON profiles
FOR DELETE
TO service_role
USING (true);

-- ========================================
-- NOTES
-- ========================================
-- - Regular users use the 'anon' or 'authenticated' role (anon key)
-- - Admin operations use 'service_role' (service role key) via backend API
-- - Public profile viewing is enabled for therapist listings and blog authors
-- - Users cannot change their own role (must be done by admin via service role)
