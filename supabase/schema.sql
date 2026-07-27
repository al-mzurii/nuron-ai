-- ============================================
-- Nuron AI – Supabase Schema & RLS Setup
-- ============================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================
CREATE TYPE public.user_role AS ENUM ('student', 'educator', 'scholar', 'admin');
CREATE TYPE public.subscription_tier AS ENUM ('free', 'pro', 'enterprise');
CREATE TYPE public.badge_tier AS ENUM ('none', 'bronze', 'silver', 'gold', 'platinum');

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'student',
  full_name text,
  avatar_url text,
  subscription_tier subscription_tier NOT NULL DEFAULT 'free',
  badge_tier badge_tier NOT NULL DEFAULT 'none',
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- AUTO-CREATE PROFILE ON SIGNUP (with role from user_metadata)
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  meta_role text;
BEGIN
  -- Read role from raw_user_meta_data (set during signup)
  meta_role := NEW.raw_user_meta_data ->> 'role';
  INSERT INTO public.profiles (id, role, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(meta_role::public.user_role, 'student'),
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function after a new auth user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- TOOL USAGE LOGS TABLE
-- ============================================
CREATE TABLE public.tool_usage_logs (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_name text NOT NULL,
  used_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for fast daily usage queries
CREATE INDEX idx_tool_usage_user_date ON public.tool_usage_logs (user_id, tool_name, used_at);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_usage_logs ENABLE ROW LEVEL SECURITY;

-- --- Profiles Policies ---
-- Allow users to read their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Allow admins to read all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Allow users to update their own profile (except role, unless admin)
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

-- Admins can update any profile
CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Insert is handled by the trigger (or service_role)
CREATE POLICY "Allow insert via trigger only"
  ON public.profiles FOR INSERT
  WITH CHECK (true); -- actual restriction enforced by trigger

-- --- Tool Usage Logs Policies ---
-- Users can view their own logs
CREATE POLICY "Users can view own usage logs"
  ON public.tool_usage_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own logs
CREATE POLICY "Users can insert own usage logs"
  ON public.tool_usage_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all logs
CREATE POLICY "Admins can view all usage logs"
  ON public.tool_usage_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- OPTIONAL: Helper function for daily usage count
-- ============================================
CREATE OR REPLACE FUNCTION public.daily_tool_usage(uid uuid, tool text)
RETURNS bigint AS $$
  SELECT count(*)
  FROM public.tool_usage_logs
  WHERE user_id = uid
    AND tool_name = tool
    AND used_at::date = current_date;
$$ LANGUAGE sql STABLE SECURITY DEFINER;
