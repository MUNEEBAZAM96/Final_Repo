-- Supabase Database Setup SQL
-- Run this in your Supabase SQL Editor

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  resume_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Create parsed_resumes table
CREATE TABLE IF NOT EXISTS parsed_resumes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  raw_text TEXT NOT NULL,
  structured_json JSONB NOT NULL,
  skills TEXT[] DEFAULT '{}',
  experience JSONB DEFAULT '[]',
  education JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Create job_matches table
CREATE TABLE IF NOT EXISTS job_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  url TEXT NOT NULL,
  match_score INTEGER NOT NULL CHECK (match_score >= 0 AND match_score <= 100),
  why_match TEXT,
  applied BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Create interview_preps table
CREATE TABLE IF NOT EXISTS interview_preps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  technologies TEXT[] DEFAULT '{}',
  questions_json JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_parsed_resumes_user_id ON parsed_resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_job_matches_user_id ON job_matches(user_id);
CREATE INDEX IF NOT EXISTS idx_job_matches_match_score ON job_matches(match_score DESC);
CREATE INDEX IF NOT EXISTS idx_interview_preps_user_id ON interview_preps(user_id);

-- 7. Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE parsed_resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_preps ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS Policies
-- Profiles: Users can read/update their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Parsed Resumes: Users can only access their own resumes
CREATE POLICY "Users can view own resumes" ON parsed_resumes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own resumes" ON parsed_resumes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Job Matches: Users can only access their own job matches
CREATE POLICY "Users can view own job matches" ON job_matches
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own job matches" ON job_matches
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own job matches" ON job_matches
  FOR UPDATE USING (auth.uid() = user_id);

-- Interview Preps: Users can only access their own interview preps
CREATE POLICY "Users can view own interview preps" ON interview_preps
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own interview preps" ON interview_preps
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 9. Create Storage Bucket for Resumes
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', true)
ON CONFLICT (id) DO NOTHING;

-- 10. Create Storage Policy for Resumes
CREATE POLICY "Users can upload own resumes"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own resumes"
ON storage.objects FOR SELECT
USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own resumes"
ON storage.objects FOR DELETE
USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

