// types/correspondence.ts
export interface Correspondence {
  id: string
  user_id: string | null
  
  // Basic Information
  name: string
  category: string
  description?: string | null
  botanical_name?: string | null
  common_names?: string[]
  
  // Magical Properties & Applications
  magical_properties: string[]
  traditional_uses?: string[]
  medical_uses?: string[]
  personal_applications?: string[]
  personal_notes?: string | null
  
  // Elemental & Planetary Correspondences
  element?: string | null
  planet?: string | null
  zodiac_sign?: string | null
  chakra?: string | null
  energy_type?: 'masculine' | 'feminine' | null
  
  // Spiritual Associations
  deities?: string[]
  
  // Cultural & Historical
  cultural_traditions?: Record<string, string> | null
  folklore?: string | null
  historical_uses?: string[]
  
  // System fields
  is_personal: boolean
  is_favorited: boolean
  source?: string | null
  verified?: boolean
  created_at: string
  updated_at: string
}

export interface CreateCorrespondenceRequest {
  name: string
  category: string
  description?: string | null
  botanical_name?: string | null
  common_names?: string[]
  magical_properties: string[]
  traditional_uses?: string[]
  medical_uses?: string[]
  personal_applications?: string[]
  personal_notes?: string | null
  element?: string | null
  planet?: string | null
  zodiac_sign?: string | null
  chakra?: string | null
  energy_type?: 'masculine' | 'feminine' | null
  deities?: string[]
  cultural_traditions?: Record<string, string> | null
  folklore?: string | null
  historical_uses?: string[]
  is_personal?: boolean
}

export interface UpdateCorrespondenceRequest extends Partial<CreateCorrespondenceRequest> {
  is_favorited?: boolean
}

export interface CorrespondenceFilters {
  category?: string
  element?: string
  energy_type?: 'masculine' | 'feminine'
  planet?: string
  property?: string
  personal_only?: boolean
  favorites_only?: boolean
}

export interface CorrespondenceSearchResult extends Correspondence {
  relevance_score?: number
}

export const CORRESPONDENCE_CATEGORIES = [
  { value: 'herbs', label: 'Herbs & Plants', icon: '🌿' },
  { value: 'crystals', label: 'Crystals & Stones', icon: '💎' },
  { value: 'colors', label: 'Colors', icon: '🎨' },
  { value: 'elements', label: 'Elements', icon: '🔥' },
  { value: 'tools', label: 'Magical Tools', icon: '🔮' },
  { value: 'incense', label: 'Incense & Resins', icon: '🕯️' },
  { value: 'oils', label: 'Essential Oils', icon: '🫗' },
  { value: 'candles', label: 'Candles', icon: '🕯️' },
  { value: 'symbols', label: 'Symbols & Sigils', icon: '✨' },
  { value: 'deities', label: 'Deities & Spirits', icon: '👑' },
  { value: 'animals', label: 'Animal Spirits', icon: '🦋' },
  { value: 'trees', label: 'Sacred Trees', icon: '🌳' },
  { value: 'other', label: 'Other', icon: '📜' }
] as const

export const MAGICAL_PROPERTIES = [
  'protection', 'love', 'abundance', 'healing', 'banishing', 'cleansing',
  'divination', 'wisdom', 'courage', 'peace', 'psychic_abilities', 
  'spiritual_growth', 'grounding', 'transformation', 'communication',
  'prosperity', 'fertility', 'luck', 'success', 'creativity', 'intuition',
  'balance', 'harmony', 'strength', 'clarity', 'manifestation', 'warding',
  'purification', 'conflict_resolution'
] as const

export const ELEMENTS = ['Fire', 'Water', 'Earth', 'Air', 'Spirit'] as const
export const PLANETS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'] as const
export const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
] as const
export const CHAKRAS = ['Root', 'Sacral', 'Solar Plexus', 'Heart', 'Throat', 'Third Eye', 'Crown'] as const
export const ENERGY_TYPES = ['masculine', 'feminine'] as const