// lib/utils/correspondence-utils.ts
import { Correspondence, CORRESPONDENCE_CATEGORIES, MAGICAL_PROPERTIES } from '@/types/correspondence'

/**
 * Get category icon for a correspondence category
 */
export function getCategoryIcon(category: string): string {
  const categoryData = CORRESPONDENCE_CATEGORIES.find(cat => cat.value === category)
  return categoryData?.icon || '📜'
}

/**
 * Get category label for a correspondence category
 */
export function getCategoryLabel(category: string): string {
  const categoryData = CORRESPONDENCE_CATEGORIES.find(cat => cat.value === category)
  return categoryData?.label || 'Other'
}

/**
 * Get color class for a magical property
 */
export function getPropertyColor(property: string): string {
  const colorMap: Record<string, string> = {
    'protection': 'text-blue-400 bg-blue-900/20',
    'love': 'text-pink-400 bg-pink-900/20',
    'abundance': 'text-green-400 bg-green-900/20',
    'healing': 'text-emerald-400 bg-emerald-900/20',
    'banishing': 'text-red-400 bg-red-900/20',
    'cleansing': 'text-cyan-400 bg-cyan-900/20',
    'divination': 'text-purple-400 bg-purple-900/20',
    'wisdom': 'text-indigo-400 bg-indigo-900/20',
    'courage': 'text-orange-400 bg-orange-900/20',
    'peace': 'text-sky-400 bg-sky-900/20',
    'psychic_abilities': 'text-violet-400 bg-violet-900/20',
    'spiritual_growth': 'text-amber-400 bg-amber-900/20',
    'grounding': 'text-stone-400 bg-stone-900/20',
    'transformation': 'text-fuchsia-400 bg-fuchsia-900/20',
    'communication': 'text-yellow-400 bg-yellow-900/20',
    'prosperity': 'text-green-500 bg-green-900/20',
    'fertility': 'text-pink-500 bg-pink-900/20',
    'luck': 'text-yellow-500 bg-yellow-900/20',
    'success': 'text-orange-500 bg-orange-900/20',
    'creativity': 'text-purple-500 bg-purple-900/20',
    'intuition': 'text-indigo-500 bg-indigo-900/20',
    'balance': 'text-cyan-500 bg-cyan-900/20',
    'harmony': 'text-sky-500 bg-sky-900/20',
    'strength': 'text-red-500 bg-red-900/20',
    'clarity': 'text-blue-500 bg-blue-900/20',
    'manifestation': 'text-purple-600 bg-purple-900/20',
    'warding': 'text-blue-600 bg-blue-900/20',
    'purification': 'text-cyan-600 bg-cyan-900/20',
    'conflict_resolution': 'text-pink-600 bg-pink-900/20'
  }
  return colorMap[property] || 'text-gray-400 bg-gray-900/20'
}

/**
 * Format magical property name for display
 */
export function formatPropertyName(property: string): string {
  return property.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
}

/**
 * Filter correspondences by multiple criteria
 */
export function filterCorrespondences(
  correspondences: Correspondence[],
  filters: {
    searchTerm?: string
    category?: string
    element?: string
    energy?: 'masculine' | 'feminine'
    planet?: string
    property?: string
    personalOnly?: boolean
    favoritesOnly?: boolean
  }
): Correspondence[] {
  return correspondences.filter(correspondence => {
    // Search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase()
      const searchableText = [
        correspondence.name,
        correspondence.description,
        correspondence.botanical_name,
        correspondence.personal_notes,
        correspondence.folklore,
        ...(correspondence.common_names || []),
        ...(correspondence.magical_properties || []),
        ...(correspondence.traditional_uses || []),
        ...(correspondence.medical_uses || []),
        ...(correspondence.deities || [])
      ].filter(Boolean).join(' ').toLowerCase()
      
      if (!searchableText.includes(searchLower)) return false
    }

    // Category filter
    if (filters.category && correspondence.category !== filters.category) return false

    // Element filter
    if (filters.element && correspondence.element !== filters.element) return false

    // Energy filter
    if (filters.energy && correspondence.energy_type !== filters.energy) return false

    // Planet filter
    if (filters.planet && correspondence.planet !== filters.planet) return false

    // Property filter
    if (filters.property && !correspondence.magical_properties.includes(filters.property)) return false

    // Personal filter
    if (filters.personalOnly && !correspondence.is_personal) return false

    // Favorites filter
    if (filters.favoritesOnly && !correspondence.is_favorited) return false

    return true
  })
}

/**
 * Sort correspondences by various criteria
 */
export function sortCorrespondences(
  correspondences: Correspondence[],
  sortBy: 'name' | 'category' | 'created_at' | 'updated_at' | 'verified',
  order: 'asc' | 'desc' = 'asc'
): Correspondence[] {
  return [...correspondences].sort((a, b) => {
    let comparison = 0

    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name)
        break
      case 'category':
        comparison = a.category.localeCompare(b.category)
        break
      case 'created_at':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        break
      case 'updated_at':
        comparison = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
        break
      case 'verified':
        // Verified entries first
        if (a.verified && !b.verified) comparison = -1
        else if (!a.verified && b.verified) comparison = 1
        else comparison = a.name.localeCompare(b.name)
        break
    }

    return order === 'desc' ? -comparison : comparison
  })
}

/**
 * Get correspondence statistics
 */
export function getCorrespondenceStats(correspondences: Correspondence[]) {
  const stats = {
    total: correspondences.length,
    personal: correspondences.filter(c => c.is_personal).length,
    favorited: correspondences.filter(c => c.is_favorited).length,
    verified: correspondences.filter(c => c.verified).length,
    byCategory: {} as Record<string, number>,
    byElement: {} as Record<string, number>,
    topProperties: [] as Array<{ property: string; count: number }>
  }

  // Count by category
  correspondences.forEach(c => {
    stats.byCategory[c.category] = (stats.byCategory[c.category] || 0) + 1
    if (c.element) {
      stats.byElement[c.element] = (stats.byElement[c.element] || 0) + 1
    }
  })

  // Count magical properties
  const propertyCount: Record<string, number> = {}
  correspondences.forEach(c => {
    c.magical_properties.forEach(prop => {
      propertyCount[prop] = (propertyCount[prop] || 0) + 1
    })
  })

  // Get top 10 properties
  stats.topProperties = Object.entries(propertyCount)
    .map(([property, count]) => ({ property, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  return stats
}

/**
 * Validate correspondence data
 */
export function validateCorrespondence(data: Partial<Correspondence>): string[] {
  const errors: string[] = []

  if (!data.name?.trim()) {
    errors.push('Name is required')
  }

  if (!data.category) {
    errors.push('Category is required')
  }

  if (!data.magical_properties || data.magical_properties.length === 0) {
    errors.push('At least one magical property is required')
  }

  if (data.energy_type && !['masculine', 'feminine'].includes(data.energy_type)) {
    errors.push('Energy type must be either masculine or feminine')
  }

  return errors
}

/**
 * Generate correspondence summary text
 */
export function generateCorrespondenceSummary(correspondence: Correspondence): string {
  const parts: string[] = []

  parts.push(`${correspondence.name} is a ${correspondence.category}`)

  if (correspondence.element) {
    parts.push(`associated with the ${correspondence.element} element`)
  }

  if (correspondence.magical_properties.length > 0) {
    const properties = correspondence.magical_properties
      .slice(0, 3)
      .map(formatPropertyName)
      .join(', ')
    parts.push(`known for ${properties}`)
  }

  if (correspondence.traditional_uses && correspondence.traditional_uses.length > 0) {
    parts.push(`traditionally used for ${correspondence.traditional_uses[0].toLowerCase()}`)
  }

  return parts.join(' ') + '.'
}

/**
 * Export correspondences to CSV format
 */
export function exportCorrespondencesToCSV(correspondences: Correspondence[]): string {
  const headers = [
    'Name', 'Category', 'Description', 'Botanical Name', 'Common Names',
    'Magical Properties', 'Traditional Uses', 'Medical Uses', 'Element',
    'Planet', 'Zodiac Sign', 'Chakra', 'Energy Type', 'Deities',
    'Folklore', 'Personal Notes', 'Is Personal', 'Is Favorited',
    'Created At', 'Updated At'
  ]

  const rows = correspondences.map(c => [
    c.name,
    c.category,
    c.description || '',
    c.botanical_name || '',
    (c.common_names || []).join('; '),
    c.magical_properties.join('; '),
    (c.traditional_uses || []).join('; '),
    (c.medical_uses || []).join('; '),
    c.element || '',
    c.planet || '',
    c.zodiac_sign || '',
    c.chakra || '',
    c.energy_type || '',
    (c.deities || []).join('; '),
    c.folklore || '',
    c.personal_notes || '',
    c.is_personal.toString(),
    c.is_favorited.toString(),
    c.created_at,
    c.updated_at
  ])

  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${field.toString().replace(/"/g, '""')}"`).join(','))
    .join('\n')

  return csvContent
}