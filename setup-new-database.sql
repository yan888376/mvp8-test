-- SETUP NEW DATABASE FOR MVP_8 PROJECT
-- This script creates all necessary tables, triggers, and policies

-- Step 1: Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    custom_count INTEGER DEFAULT 0,
    is_pro BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create user_settings table
CREATE TABLE IF NOT EXISTS public.user_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    theme TEXT DEFAULT 'dark' CHECK (theme IN ('light', 'dark')),
    layout TEXT DEFAULT 'grid' CHECK (layout IN ('grid', 'list', 'compact')),
    show_favorites_first BOOLEAN DEFAULT TRUE,
    auto_sync BOOLEAN DEFAULT TRUE,
    notifications_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    plan_type TEXT DEFAULT 'free' CHECK (plan_type IN ('free', 'pro', 'enterprise')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'cancelled', 'expired')),
    current_period_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    current_period_end TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Create custom_websites table
CREATE TABLE IF NOT EXISTS public.custom_websites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    category TEXT,
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 5: Create favorites table
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    website_id UUID REFERENCES public.custom_websites(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, website_id)
);

-- Step 6: Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Step 7: Create RLS Policies
-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- User settings policies
CREATE POLICY "Users can view own settings" ON public.user_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON public.user_settings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON public.user_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Subscriptions policies
CREATE POLICY "Users can view own subscription" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription" ON public.subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription" ON public.subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Custom websites policies
CREATE POLICY "Users can view own websites" ON public.custom_websites
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own websites" ON public.custom_websites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own websites" ON public.custom_websites
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own websites" ON public.custom_websites
    FOR DELETE USING (auth.uid() = user_id);

-- Favorites policies
CREATE POLICY "Users can view own favorites" ON public.favorites
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites" ON public.favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" ON public.favorites
    FOR DELETE USING (auth.uid() = user_id);

-- Step 8: Create trigger function for new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert profile
    INSERT INTO public.profiles (id, email, custom_count, is_pro, created_at, updated_at)
    VALUES (NEW.id, NEW.email, 0, FALSE, NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;
    
    -- Insert user settings
    INSERT INTO public.user_settings (user_id, theme, layout, show_favorites_first, auto_sync, notifications_enabled, created_at, updated_at)
    VALUES (NEW.id, 'dark', 'grid', TRUE, TRUE, TRUE, NOW(), NOW())
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Insert subscription
    INSERT INTO public.subscriptions (user_id, plan_type, status, current_period_start, current_period_end, created_at, updated_at)
    VALUES (NEW.id, 'free', 'active', NOW(), NOW() + INTERVAL '30 days', NOW(), NOW())
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 9: Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 10: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON public.user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_websites_user_id ON public.custom_websites(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_websites_category ON public.custom_websites(category);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_website_id ON public.favorites(website_id);

-- Step 11: Verification queries
SELECT '=== DATABASE SETUP COMPLETE ===' as status;
SELECT 'Tables created:' as info;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
SELECT 'Triggers created:' as info;
SELECT trigger_name FROM information_schema.triggers WHERE trigger_schema = 'public';
SELECT 'Policies created:' as info;
SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public'; 