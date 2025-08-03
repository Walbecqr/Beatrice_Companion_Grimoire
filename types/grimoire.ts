// Grimoire types and interfaces
export interface GrimoireEntry {
  id: string
  user_id: string
  title: string
  type: GrimoireEntryType // Using a specific type for better type safety
  category: string | null
  content: string | null // This exists but instructions is the main content field
  subcategory: string | null
  description: string | null
  intent: string | null
  best_timing: string | null
  difficulty_level: number | null
  moon_phase: string | null
  season: string | null
  element: string | null
  planet: string | null
  chakra: string | null
  tags: string[] | null // ARRAY type (direct on table)
  is_favorite: boolean // DEFAULT false
  is_tested: boolean // DEFAULT false
  effectiveness_rating: number | null
  
  // Timestamps
  created_at: string
  updated_at: string
}

// Type for the form data when creating a new entry
export interface CreateGrimoireEntryData {
  title: string
  type: GrimoireEntry['type']
  purpose?: string
  ingredients?: string[]
  instructions: string
  notes?: string
  source?: string
  moon_phase_compatibility?: string[]
  is_public?: boolean
  category?: string
  content?: string
  subcategory?: string
  description?: string
  intent?: string
  best_timing?: string
  difficulty_level?: number
  moon_phase?: string
  season?: string
  element?: string
  planet?: string
  chakra?: string
  tags?: string[]
  is_favorite?: boolean
  is_tested?: boolean
  effectiveness_rating?: number
}

// Valid type options (matches CHECK constraint in database)
export const GRIMOIRE_ENTRY_TYPES = [
  'ritual',
  'spell', 
  'chant',
  'blessing',
  'invocation',
  'meditation',
  'divination',
  'other'
] as const

// Type derived from the const array
export type GrimoireEntryType = typeof GRIMOIRE_ENTRY_TYPES[number]

// Type guard function
export function isValidGrimoireType(type: string): type is GrimoireEntry['type'] {
  return GRIMOIRE_ENTRY_TYPES.includes(type as GrimoireEntry['type'])
}