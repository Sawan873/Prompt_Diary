-- ============================================================
-- Prompt Diary — Migration 004: Add Admin Role
-- ============================================================

-- 1. Add is_admin column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- 2. Update Row Level Security (RLS) policies for Profiles so admins can update any profile if needed
-- Standard users can still only update their own profile
CREATE POLICY "Admins can update any profile"
    ON public.profiles FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );
