-- Fix Row Level Security Policies for Questions Table
-- Run this in Supabase SQL Editor

-- Drop all existing policies for questions table
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'questions' AND schemaname = 'public') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON questions';
    END LOOP;
END $$;

-- Create new policies for questions table
CREATE POLICY "Anyone can insert questions"
  ON questions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can select questions"
  ON questions FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update questions"
  ON questions FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete questions"
  ON questions FOR DELETE
  USING (true);

-- Fix Storage Bucket Policy for question-photos
-- IMPORTANT: Run this in Supabase SQL Editor

-- First, ensure bucket exists and is public
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'question-photos',
  'question-photos',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp']
)
ON CONFLICT (id) 
DO UPDATE SET 
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];

-- Disable RLS for development (ONLY FOR DEVELOPMENT)
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Or if you want to keep RLS enabled, use these policies:
-- DROP all existing policies first
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON storage.objects';
    END LOOP;
END $$;

-- Create permissive policies for question-photos bucket
CREATE POLICY "Anyone can view question photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'question-photos');

CREATE POLICY "Anyone can upload question photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'question-photos');

CREATE POLICY "Anyone can update question photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'question-photos')
WITH CHECK (bucket_id = 'question-photos');

CREATE POLICY "Anyone can delete question photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'question-photos');
