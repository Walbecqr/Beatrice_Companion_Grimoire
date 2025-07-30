-- Migration script to enhance existing correspondences table
-- Run this against your existing database

-- Add new columns to existing correspondences table
ALTER TABLE correspondences 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS botanical_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS common_names TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS medical_uses TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS personal_applications TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS energy_type VARCHAR(20) CHECK (energy_type IN ('masculine', 'feminine')),
ADD COLUMN IF NOT EXISTS deities TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS cultural_traditions JSONB,
ADD COLUMN IF NOT EXISTS folklore TEXT,
ADD COLUMN IF NOT EXISTS historical_uses TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS source VARCHAR(255),
ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false;

-- Add new indexes for enhanced search
CREATE INDEX IF NOT EXISTS idx_correspondences_energy_type ON correspondences(energy_type);
CREATE INDEX IF NOT EXISTS idx_correspondences_verified ON correspondences(verified);
CREATE INDEX IF NOT EXISTS idx_correspondences_botanical_name ON correspondences(botanical_name);
CREATE INDEX IF NOT EXISTS idx_correspondences_deities ON correspondences USING GIN(deities);
CREATE INDEX IF NOT EXISTS idx_correspondences_cultural_traditions ON correspondences USING GIN(cultural_traditions);
CREATE INDEX IF NOT EXISTS idx_correspondences_common_names ON correspondences USING GIN(common_names);
CREATE INDEX IF NOT EXISTS idx_correspondences_medical_uses ON correspondences USING GIN(medical_uses);
CREATE INDEX IF NOT EXISTS idx_correspondences_historical_uses ON correspondences USING GIN(historical_uses);

-- Drop existing full-text search index if it exists
DROP INDEX IF EXISTS idx_correspondences_fulltext;

-- Create enhanced full-text search index
CREATE INDEX idx_correspondences_fulltext ON correspondences USING GIN(
  to_tsvector('english', 
    COALESCE(name, '') || ' ' || 
    COALESCE(description, '') || ' ' || 
    COALESCE(botanical_name, '') || ' ' ||
    COALESCE(personal_notes, '') || ' ' ||
    COALESCE(folklore, '') || ' ' ||
    array_to_string(COALESCE(magical_properties, '{}'), ' ') || ' ' ||
    array_to_string(COALESCE(traditional_uses, '{}'), ' ') || ' ' ||
    array_to_string(COALESCE(medical_uses, '{}'), ' ') || ' ' ||
    array_to_string(COALESCE(common_names, '{}'), ' ') || ' ' ||
    array_to_string(COALESCE(deities, '{}'), ' ') || ' ' ||
    array_to_string(COALESCE(historical_uses, '{}'), ' ')
  )
);

-- Update existing system correspondences to mark them as verified
UPDATE correspondences 
SET verified = true, source = 'System Default'
WHERE user_id IS NULL;

-- Create or replace enhanced search function
CREATE OR REPLACE FUNCTION search_correspondences_enhanced(
  search_term TEXT,
  user_uuid UUID DEFAULT NULL,
  category_filter VARCHAR(50) DEFAULT NULL,
  element_filter VARCHAR(50) DEFAULT NULL,
  energy_filter VARCHAR(20) DEFAULT NULL,
  planet_filter VARCHAR(50) DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  name VARCHAR(255),
  category VARCHAR(50),
  element VARCHAR(50),
  planet VARCHAR(50),
  energy_type VARCHAR(20),
  magical_properties TEXT[],
  deities TEXT[],
  is_personal BOOLEAN,
  is_favorited BOOLEAN,
  verified BOOLEAN,
  relevance_score FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.category,
    c.element,
    c.planet,
    c.energy_type,
    c.magical_properties,
    c.deities,
    c.is_personal,
    c.is_favorited,
    c.verified,
    CASE 
      WHEN search_term IS NOT NULL THEN
        ts_rank(
          to_tsvector('english', 
            COALESCE(c.name, '') || ' ' || 
            COALESCE(c.description, '') || ' ' || 
            COALESCE(c.botanical_name, '') || ' ' ||
            COALESCE(c.personal_notes, '') || ' ' ||
            COALESCE(c.folklore, '') || ' ' ||
            array_to_string(COALESCE(c.magical_properties, '{}'), ' ') || ' ' ||
            array_to_string(COALESCE(c.traditional_uses, '{}'), ' ') || ' ' ||
            array_to_string(COALESCE(c.medical_uses, '{}'), ' ') || ' ' ||
            array_to_string(COALESCE(c.common_names, '{}'), ' ') || ' ' ||
            array_to_string(COALESCE(c.deities, '{}'), ' ') || ' ' ||
            array_to_string(COALESCE(c.historical_uses, '{}'), ' ')
          ),
          plainto_tsquery('english', search_term)
        )
      ELSE 0.0
    END AS relevance_score
  FROM correspondences c
  WHERE 
    (user_uuid IS NULL OR c.user_id = user_uuid OR c.user_id IS NULL)
    AND (category_filter IS NULL OR c.category = category_filter)
    AND (element_filter IS NULL OR c.element = element_filter)  
    AND (energy_filter IS NULL OR c.energy_type = energy_filter)
    AND (planet_filter IS NULL OR c.planet = planet_filter)
    AND (
      search_term IS NULL OR
      to_tsvector('english', 
        COALESCE(c.name, '') || ' ' || 
        COALESCE(c.description, '') || ' ' || 
        COALESCE(c.botanical_name, '') || ' ' ||
        COALESCE(c.personal_notes, '') || ' ' ||
        COALESCE(c.folklore, '') || ' ' ||
        array_to_string(COALESCE(c.magical_properties, '{}'), ' ') || ' ' ||
        array_to_string(COALESCE(c.traditional_uses, '{}'), ' ') || ' ' ||
        array_to_string(COALESCE(c.medical_uses, '{}'), ' ') || ' ' ||
        array_to_string(COALESCE(c.common_names, '{}'), ' ') || ' ' ||
        array_to_string(COALESCE(c.deities, '{}'), ' ') || ' ' ||
        array_to_string(COALESCE(c.historical_uses, '{}'), ' ')
      ) @@ plainto_tsquery('english', search_term)
    )
  ORDER BY 
    CASE WHEN search_term IS NOT NULL THEN relevance_score ELSE 0 END DESC,
    c.verified DESC, -- Verified entries first
    c.name ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Sample enhanced correspondence entry (optional - demonstrates new fields)
INSERT INTO correspondences (
  user_id,
  name,
  category,
  description,
  botanical_name,
  common_names,
  magical_properties,
  traditional_uses,
  medical_uses,
  element,
  energy_type,
  planet,
  zodiac_sign,
  chakra,
  deities,
  cultural_traditions,
  folklore,
  historical_uses,
  source,
  verified,
  is_personal
) VALUES (
  NULL, -- System entry
  'White Sage',
  'herbs',
  'A perennial shrub native to California and Baja California. Has silvery-white leaves and produces white flowers. Highly aromatic with a distinctive earthy, herbaceous scent.',
  'Salvia apiana',
  ARRAY['Sacred Sage', 'California White Sage', 'Bee Sage'],
  ARRAY['cleansing', 'protection', 'purification', 'wisdom', 'healing'],
  ARRAY[
    'Space clearing and purification rituals',
    'Spiritual cleansing ceremonies', 
    'Protection from negative energies',
    'Meditation enhancement',
    'Sacred smudging practices'
  ],
  ARRAY[
    'Antimicrobial properties when burned',
    'Respiratory support aromatherapy',
    'Traditional wound healing'
  ],
  'Air',
  'masculine',
  'Jupiter',
  'Sagittarius',
  'Crown',
  ARRAY['White Buffalo Calf Woman', 'Grandfather Spirit'],
  '{
    "Native_American": "Sacred plant used in smudging ceremonies for purification and prayer",
    "Modern_Pagan": "Essential tool for cleansing ritual spaces and personal auras",
    "New_Age": "Popular for space clearing and energy work"
  }'::jsonb,
  'Considered one of the most sacred plants by many Native American tribes. Used for thousands of years in ceremony and healing. The smoke is believed to carry prayers to the spirit world and cleanse negative energies.',
  ARRAY[
    'Native American ceremonial and healing practices',
    'Traditional California indigenous medicine',
    'Modern adoption in neo-pagan and witchcraft practices'
  ],
  'Traditional Knowledge - Indigenous Wisdom',
  true,
  false
) ON CONFLICT (name, category) DO NOTHING; -- Avoid duplicates if running multiple times

-- Verify migration completed successfully
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'correspondences' 
ORDER BY ordinal_position;