// types/grimoire.ts - TypeScript types for Grimoire entries

export interface GrimoireEntry {
  id: string
  user_id: string
  
  // Basic Information
  title: string
  type: GrimoireEntryType
  category?: string
  
  // Content
  description?: string
  ingredients?: string[]
  instructions?: string
  notes?: string
  
  // Magical Properties
  intent?: string
  best_timing?: string
  difficulty_level?: DifficultyLevel
  
  // Correspondences
  moon_phase?: string
  season?: Season
  element?: Element
  planet?: string
  chakra?: string
  
  // Metadata
  source?: string
  tags?: string[]
  is_favorite: boolean
  is_tested: boolean
  effectiveness_rating?: number // 1-5 scale
  
  // Timestamps
  created_at: string
  updated_at: string
}

export type GrimoireEntryType = 
  | 'spell'
  | 'ritual'
  | 'recipe'
  | 'knowledge'
  | 'divination'

export type DifficultyLevel = 
  | 'beginner'
  | 'intermediate' 
  | 'advanced'

export type Season = 
  | 'spring'
  | 'summer'
  | 'autumn'
  | 'winter'

export type Element = 
  | 'fire'
  | 'water'
  | 'earth'
  | 'air'
  | 'spirit'

export interface CreateGrimoireEntryData {
  title: string
  type: GrimoireEntryType
  category?: string
  description?: string
  ingredients?: string[]
  instructions?: string
  notes?: string
  intent?: string
  best_timing?: string
  difficulty_level?: DifficultyLevel
  moon_phase?: string
  season?: Season
  element?: Element
  planet?: string
  chakra?: string
  source?: string
  tags?: string[]
  is_favorite?: boolean
  is_tested?: boolean
  effectiveness_rating?: number
}

export interface UpdateGrimoireEntryData extends CreateGrimoireEntryData {
  id: string
}

export interface GrimoireFilters {
  search?: string
  type?: GrimoireEntryType
  category?: string
  difficulty_level?: DifficultyLevel
  element?: Element
  season?: Season
  is_favorite?: boolean
  is_tested?: boolean
}

export interface GrimoirePagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface GrimoireApiResponse {
  entries: GrimoireEntry[]
  pagination: GrimoirePagination
}

// Constants for dropdowns and validation
export const GRIMOIRE_ENTRY_TYPES: { value: GrimoireEntryType; label: string }[] = [
  { value: 'spell', label: 'Spell' },
  { value: 'ritual', label: 'Ritual' },
  { value: 'recipe', label: 'Recipe/Potion' },
  { value: 'knowledge', label: 'Knowledge/Lore' },
  { value: 'divination', label: 'Divination Method' }
]

export const DIFFICULTY_LEVELS: { value: DifficultyLevel; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' }
]

export const SEASONS: { value: Season; label: string }[] = [
  { value: 'spring', label: 'Spring' },
  { value: 'summer', label: 'Summer' },
  { value: 'autumn', label: 'Autumn' },
  { value: 'winter', label: 'Winter' }
]

export const ELEMENTS: { value: Element; label: string }[] = [
  { value: 'fire', label: 'Fire' },
  { value: 'water', label: 'Water' },
  { value: 'earth', label: 'Earth' },
  { value: 'air', label: 'Air' },
  { value: 'spirit', label: 'Spirit' }
]

export const MOON_PHASES = [
  'New Moon',
  'Waxing Crescent',
  'First Quarter',
  'Waxing Gibbous',
  'Full Moon',
  'Waning Gibbous',
  'Last Quarter',
  'Waning Crescent'
]

export const PLANETS = [
  'Sun',
  'Moon', 
  'Mercury',
  'Venus',
  'Mars',
  'Jupiter',
  'Saturn',
  'Uranus',
  'Neptune',
  'Pluto'
]

export const CHAKRAS = [
  'Root',
  'Sacral',
  'Solar Plexus',
  'Heart',
  'Throat',
  'Third Eye',
  'Crown'
]