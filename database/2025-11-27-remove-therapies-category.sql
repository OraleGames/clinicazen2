-- Migration file to remove category column from therapies table
-- Run this SQL code in your Supabase SQL dashboard to update the existing schema

-- Remove the category column from therapies table
ALTER TABLE therapies DROP COLUMN IF EXISTS category;