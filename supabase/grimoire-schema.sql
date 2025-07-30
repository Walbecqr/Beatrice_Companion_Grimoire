-- Grimoire entries table
CREATE TABLE public.grimoire_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('ritual', 'spell', 'chant', 'blessing', 'invocation', 'meditation', 'divination', 'other')),
    purpose TEXT,
    ingredients TEXT[], -- For spells and rituals that need materials
    instructions TEXT NOT NULL,
    notes TEXT,
    source TEXT, -- Where it came from (book, tradition, personal creation, etc.)
    moon_phase_compatibility TEXT[], -- Which moon phases this works best with
    is_public BOOLEAN DEFAULT FALSE, -- For future community sharing
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Grimoire tags (separate from journal tags)
CREATE TABLE public.grimoire_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    category TEXT, -- 'element', 'deity', 'purpose', 'tradition', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Grimoire entry tags (many-to-many)
CREATE TABLE public.grimoire_entry_tags (
    grimoire_entry_id UUID NOT NULL REFERENCES public.grimoire_entries(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES public.grimoire_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (grimoire_entry_id, tag_id)
);

-- Link grimoire entries to rituals performed
CREATE TABLE public.ritual_grimoire_links (
    ritual_id UUID NOT NULL REFERENCES public.rituals(id) ON DELETE CASCADE,
    grimoire_entry_id UUID NOT NULL REFERENCES public.grimoire_entries(id) ON DELETE CASCADE,
    PRIMARY KEY (ritual_id, grimoire_entry_id)
);

-- Create indexes
CREATE INDEX idx_grimoire_entries_user_id ON public.grimoire_entries(user_id);
CREATE INDEX idx_grimoire_entries_type ON public.grimoire_entries(type);
CREATE INDEX idx_grimoire_entry_tags_entry_id ON public.grimoire_entry_tags(grimoire_entry_id);
CREATE INDEX idx_ritual_grimoire_links_ritual_id ON public.ritual_grimoire_links(ritual_id);

-- Enable RLS
ALTER TABLE public.grimoire_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grimoire_entry_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ritual_grimoire_links ENABLE ROW LEVEL SECURITY;

-- RLS Policies for grimoire_entries
CREATE POLICY "Users can view own grimoire entries" ON public.grimoire_entries
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own grimoire entries" ON public.grimoire_entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own grimoire entries" ON public.grimoire_entries
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own grimoire entries" ON public.grimoire_entries
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for grimoire_entry_tags
CREATE POLICY "Users can manage tags on own grimoire entries" ON public.grimoire_entry_tags
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.grimoire_entries
            WHERE id = grimoire_entry_id AND user_id = auth.uid()
        )
    );

-- RLS Policies for ritual_grimoire_links
CREATE POLICY "Users can manage grimoire links on own rituals" ON public.ritual_grimoire_links
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.rituals
            WHERE id = ritual_id AND user_id = auth.uid()
        )
    );

-- Grimoire tags are public read
CREATE POLICY "Everyone can read grimoire tags" ON public.grimoire_tags
    FOR SELECT USING (true);

-- Insert default grimoire tags
INSERT INTO public.grimoire_tags (name, category) VALUES
    -- Elements
    ('Fire', 'element'),
    ('Water', 'element'),
    ('Earth', 'element'),
    ('Air', 'element'),
    ('Spirit', 'element'),
    -- Purposes
    ('Protection', 'purpose'),
    ('Love', 'purpose'),
    ('Prosperity', 'purpose'),
    ('Healing', 'purpose'),
    ('Banishing', 'purpose'),
    ('Cleansing', 'purpose'),
    ('Divination', 'purpose'),
    -- Traditions
    ('Wiccan', 'tradition'),
    ('Celtic', 'tradition'),
    ('Norse', 'tradition'),
    ('Eclectic', 'tradition'),
    ('Kitchen Witch', 'tradition'),
    ('Green Witch', 'tradition'),
    -- Deities/Spirits
    ('Goddess', 'deity'),
    ('God', 'deity'),
    ('Ancestors', 'deity'),
    ('Fae', 'deity'),
    ('Angels', 'deity');