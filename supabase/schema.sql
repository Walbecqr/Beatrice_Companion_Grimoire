-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users profile table (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    display_name TEXT,
    spiritual_path TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Journal entries table
CREATE TABLE public.journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT,
    content TEXT NOT NULL,
    mood TEXT,
    moon_phase TEXT,
    beatrice_reflection TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tags table
CREATE TABLE public.tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    category TEXT, -- 'emotion', 'moon_phase', 'deity', 'intent', 'tool'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Journal entry tags (many-to-many)
CREATE TABLE public.journal_entry_tags (
    journal_entry_id UUID NOT NULL REFERENCES public.journal_entries(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
    PRIMARY KEY (journal_entry_id, tag_id)
);

-- Chat sessions with Beatrice
CREATE TABLE public.chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat messages
CREATE TABLE public.chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily check-ins
CREATE TABLE public.daily_checkins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    prompt TEXT NOT NULL,
    response TEXT,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rituals (basic version for MVP)
CREATE TABLE public.rituals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    intent TEXT,
    description TEXT,
    moon_phase TEXT,
    tools_used TEXT[],
    outcome TEXT,
    performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_journal_entries_user_id ON public.journal_entries(user_id);
CREATE INDEX idx_chat_messages_session_id ON public.chat_messages(session_id);
CREATE INDEX idx_daily_checkins_user_id ON public.daily_checkins(user_id);
CREATE INDEX idx_rituals_user_id ON public.rituals(user_id);

-- Row Level Security (RLS) Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entry_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rituals ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Journal entries policies
CREATE POLICY "Users can view own journal entries" ON public.journal_entries
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own journal entries" ON public.journal_entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own journal entries" ON public.journal_entries
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own journal entries" ON public.journal_entries
    FOR DELETE USING (auth.uid() = user_id);

-- Similar policies for other tables
CREATE POLICY "Users can manage own chat sessions" ON public.chat_sessions
    FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own chat messages" ON public.chat_messages
    FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own daily checkins" ON public.daily_checkins
    FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own rituals" ON public.rituals
    FOR ALL USING (auth.uid() = user_id);

-- Tags are public read
CREATE POLICY "Everyone can read tags" ON public.tags
    FOR SELECT USING (true);

-- Journal entry tags follow journal entry permissions
CREATE POLICY "Users can manage tags on own journal entries" ON public.journal_entry_tags
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.journal_entries
            WHERE id = journal_entry_id AND user_id = auth.uid()
        )
    );

-- Insert default tags
INSERT INTO public.tags (name, category) VALUES
    -- Moon phases
    ('New Moon', 'moon_phase'),
    ('Waxing Crescent', 'moon_phase'),
    ('First Quarter', 'moon_phase'),
    ('Waxing Gibbous', 'moon_phase'),
    ('Full Moon', 'moon_phase'),
    ('Waning Gibbous', 'moon_phase'),
    ('Last Quarter', 'moon_phase'),
    ('Waning Crescent', 'moon_phase'),
    -- Emotions
    ('Peaceful', 'emotion'),
    ('Anxious', 'emotion'),
    ('Grateful', 'emotion'),
    ('Empowered', 'emotion'),
    ('Confused', 'emotion'),
    ('Inspired', 'emotion'),
    -- Intents
    ('Protection', 'intent'),
    ('Love', 'intent'),
    ('Healing', 'intent'),
    ('Clarity', 'intent'),
    ('Abundance', 'intent'),
    ('Release', 'intent');