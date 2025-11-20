-- Check for missing profiles and duplicate profiles

-- 1. Check if the user exists in auth.users
SELECT id, email, created_at 
FROM auth.users 
WHERE id = '0f0a00a9-e67b-4b0f-98b1-a46dd10e5ac7';

-- 2. Check if profile exists
SELECT * 
FROM profiles 
WHERE id = '0f0a00a9-e67b-4b0f-98b1-a46dd10e5ac7';

-- 3. Check for duplicate profiles (shouldn't happen - id is PRIMARY KEY)
SELECT id, COUNT(*) as count 
FROM profiles 
GROUP BY id 
HAVING COUNT(*) > 1;

-- 4. Find users in auth.users without profiles
SELECT u.id, u.email, u.created_at
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- 5. FIX: Create missing profile for the user
-- Run this if the profile doesn't exist
INSERT INTO profiles (id, email, name, role)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'name', email),
  COALESCE(raw_user_meta_data->>'role', 'PATIENT')::user_role
FROM auth.users
WHERE id = '0f0a00a9-e67b-4b0f-98b1-a46dd10e5ac7'
  AND NOT EXISTS (SELECT 1 FROM profiles WHERE id = '0f0a00a9-e67b-4b0f-98b1-a46dd10e5ac7');

-- 6. Verify the fix
SELECT * FROM profiles WHERE id = '0f0a00a9-e67b-4b0f-98b1-a46dd10e5ac7';
