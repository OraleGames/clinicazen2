-- Complete reset of profiles RLS policies
-- Run this if policies are stuck/conflicting

-- Step 1: Disable RLS temporarily
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL policies (catch-all)
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'profiles') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON profiles';
    END LOOP;
END $$;

-- Step 3: Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Step 4: Create ONLY the essential policies (no conflicts, no recursion)

-- Allow authenticated users to insert their own profile
CREATE POLICY "profiles_insert_own"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Allow everyone to read all profiles (therapist listings, blog authors, etc.)
CREATE POLICY "profiles_select_all"
ON profiles
FOR SELECT
USING (true);

-- Allow users to update their own profile
CREATE POLICY "profiles_update_own"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Service role can do everything (for admin operations)
CREATE POLICY "profiles_service_role_all"
ON profiles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
