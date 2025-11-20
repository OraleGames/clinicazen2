-- Diagnostic Script - Run this first to see your actual table structure
-- This will help us understand what columns actually exist

-- Check profiles table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- Check what's actually in the profiles table (sample data)
SELECT * FROM profiles LIMIT 3;

-- Check what enum types exist
SELECT typname, enumlabel 
FROM pg_enum 
JOIN pg_type ON pg_enum.enumtypid = pg_type.oid 
WHERE pg_type.typname = 'user_role';

-- Check if there are any other role-related columns
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND (column_name LIKE '%role%' OR column_name LIKE '%rol%');