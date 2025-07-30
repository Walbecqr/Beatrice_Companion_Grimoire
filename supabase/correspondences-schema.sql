-- Correspondences table for magical reference library
CREATE TABLE correspondences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  magical_properties TEXT[] DEFAULT '{}',
  traditional_uses TEXT[] DEFAULT '{}',
  personal_notes TEXT,
  element VARCHAR(50),
  planet VARCHAR(50),
  zodiac_sign VARCHAR(50),
  chakra VARCHAR(50),
  is_personal BOOLEAN DEFAULT true,
  is_favorited BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_correspondences_user_id ON correspondences(user_id);
CREATE INDEX idx_correspondences_category ON correspondences(category);
CREATE INDEX idx_correspondences_name ON correspondences(name);
CREATE INDEX idx_correspondences_is_personal ON correspondences(is_personal);
CREATE INDEX idx_correspondences_is_favorited ON correspondences(is_favorited);
CREATE INDEX idx_correspondences_magical_properties ON correspondences USING GIN(magical_properties);

-- RLS (Row Level Security) policies
ALTER TABLE correspondences ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own correspondences and system defaults (user_id is null)
CREATE POLICY "Users can view own correspondences and defaults" ON correspondences
  FOR SELECT USING (
    auth.uid() = user_id OR 
    user_id IS NULL
  );

-- Policy: Users can insert their own correspondences
CREATE POLICY "Users can insert own correspondences" ON correspondences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own correspondences
CREATE POLICY "Users can update own correspondences" ON correspondences
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own correspondences
CREATE POLICY "Users can delete own correspondences" ON correspondences
  FOR DELETE USING (auth.uid() = user_id);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_correspondences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_correspondences_updated_at
  BEFORE UPDATE ON correspondences
  FOR EACH ROW
  EXECUTE FUNCTION update_correspondences_updated_at();

-- Add correspondence_links table for linking correspondences to other entries
CREATE TABLE correspondence_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  correspondence_id UUID REFERENCES correspondences(id) ON DELETE CASCADE NOT NULL,
  linked_type VARCHAR(50) NOT NULL, -- 'ritual', 'journal', 'grimoire'
  linked_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for correspondence_links
CREATE INDEX idx_correspondence_links_correspondence_id ON correspondence_links(correspondence_id);
CREATE INDEX idx_correspondence_links_linked_type_id ON correspondence_links(linked_type, linked_id);
CREATE INDEX idx_correspondence_links_user_id ON correspondence_links(user_id);

-- RLS for correspondence_links
ALTER TABLE correspondence_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own correspondence links" ON correspondence_links
  FOR ALL USING (auth.uid() = user_id);

-- Function to search correspondences by text
CREATE OR REPLACE FUNCTION search_correspondences(
  search_term TEXT,
  user_uuid UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  name VARCHAR(255),
  category VARCHAR(50),
  magical_properties TEXT[],
  traditional_uses TEXT[],
  personal_notes TEXT,
  element VARCHAR(50),
  planet VARCHAR(50),
  zodiac_sign VARCHAR(50),
  chakra VARCHAR(50),
  is_personal BOOLEAN,
  is_favorited BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  relevance_score FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.category,
    c.magical_properties,
    c.traditional_uses,
    c.personal_notes,
    c.element,
    c.planet,
    c.zodiac_sign,
    c.chakra,
    c.is_personal,
    c.is_favorited,
    c.created_at,
    c.updated_at,
    -- Calculate relevance score based on where the search term appears
    (
      CASE WHEN LOWER(c.name) LIKE LOWER('%' || search_term || '%') THEN 10 ELSE 0 END +
      CASE WHEN LOWER(c.category) LIKE LOWER('%' || search_term || '%') THEN 5 ELSE 0 END +
      CASE WHEN EXISTS(SELECT 1 FROM unnest(c.magical_properties) AS prop WHERE LOWER(prop) LIKE LOWER('%' || search_term || '%')) THEN 7 ELSE 0 END +
      CASE WHEN EXISTS(SELECT 1 FROM unnest(c.traditional_uses) AS use WHERE LOWER(use) LIKE LOWER('%' || search_term || '%')) THEN 3 ELSE 0 END +
      CASE WHEN c.personal_notes IS NOT NULL AND LOWER(c.personal_notes) LIKE LOWER('%' || search_term || '%') THEN 2 ELSE 0 END
    )::FLOAT AS relevance_score
  FROM correspondences c
  WHERE 
    (user_uuid IS NULL OR c.user_id = user_uuid OR c.user_id IS NULL)
    AND (
      LOWER(c.name) LIKE LOWER('%' || search_term || '%') OR
      LOWER(c.category) LIKE LOWER('%' || search_term || '%') OR
      EXISTS(SELECT 1 FROM unnest(c.magical_properties) AS prop WHERE LOWER(prop) LIKE LOWER('%' || search_term || '%')) OR
      EXISTS(SELECT 1 FROM unnest(c.traditional_uses) AS use WHERE LOWER(use) LIKE LOWER('%' || search_term || '%')) OR
      (c.personal_notes IS NOT NULL AND LOWER(c.personal_notes) LIKE LOWER('%' || search_term || '%'))
    )
  ORDER BY relevance_score DESC, c.name ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default correspondences (system entries with user_id = NULL)
-- These will be available to all users as reference material
-- The actual inserts would be handled by the API seeding function