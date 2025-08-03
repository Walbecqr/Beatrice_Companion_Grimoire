import Fuse, { IFuseOptions } from 'fuse.js'
import { Correspondence } from '../../types/correspondence'

// Search configuration for optimal performance and relevance
const SEARCH_OPTIONS: IFuseOptions<Correspondence> = {
  // Performance optimizations
  isCaseSensitive: false,
  includeScore: true,
  shouldSort: true,
  includeMatches: true,
  findAllMatches: false,
  minMatchCharLength: 2,
  
  // Relevance tuning
  location: 0,
  threshold: 0.4, // Lower = more strict, Higher = more fuzzy
  distance: 200,
  
  // Search fields with weights
  keys: [
    { name: 'name', weight: 2.5 }, // Highest priority
    { name: 'common_names', weight: 2.0 },
    { name: 'description', weight: 1.5 },
    { name: 'magical_properties', weight: 2.0 },
    { name: 'traditional_uses', weight: 1.5 },
    { name: 'medical_uses', weight: 1.0 },
    { name: 'personal_notes', weight: 1.8 },
    { name: 'botanical_name', weight: 1.2 },
    { name: 'folklore', weight: 1.0 },
    { name: 'deities', weight: 1.3 },
    { name: 'element', weight: 1.5 },
    { name: 'planet', weight: 1.3 },
    { name: 'chakra', weight: 1.3 },
    { name: 'zodiac_sign', weight: 1.2 }
  ]
}

// Cache for Fuse instances
const fuseCache = new Map<string, CachedFuse>()
const CACHE_TTL = 300000 // 5 minutes

interface CachedFuse {
  fuse: Fuse<Correspondence>
  timestamp: number
  dataHash: string
}

/**
 * Enhanced correspondence search using Fuse.js
 */
export class CorrespondenceSearch {
  private fuseInstance: Fuse<Correspondence> | null = null
  private data: Correspondence[] = []
  private dataHash: string = ''

  constructor(correspondences: Correspondence[] = []) {
    if (correspondences.length > 0) {
      this.updateData(correspondences)
    }
  }

  /**
   * Update search data and rebuild index if needed
   */
  updateData(correspondences: Correspondence[]): void {
    const newHash = this.generateDataHash(correspondences)
    
    if (newHash === this.dataHash && this.fuseInstance) {
      return // No change needed
    }

    this.data = correspondences
    this.dataHash = newHash
    
    // Check cache first
    const cached = this.getCachedFuse(newHash)
    if (cached) {
      this.fuseInstance = cached.fuse
      return
    }

    // Build new Fuse instance
    this.fuseInstance = new Fuse(correspondences, SEARCH_OPTIONS)
    this.cacheFuse(newHash, this.fuseInstance)
  }

  /**
   * Perform fuzzy search with instant results
   */
  search(query: string, limit: number = 50): SearchResult[] {
    if (!this.fuseInstance || !query.trim()) {
      return this.data.slice(0, limit).map((item, index) => ({
        item,
        score: 0,
        matches: [],
        refIndex: index
      }))
    }

    const results = this.fuseInstance.search(query, { limit })
    
    return results.map(result => ({
      item: result.item,
      score: result.score || 0,
      matches: [...(result.matches || [])],
      refIndex: result.refIndex
    }))
  }

  /**
   * Search with advanced filters
   */
  searchWithFilters(
    query: string,
    filters: CorrespondenceFilters,
    limit: number = 50
  ): SearchResult[] {
    let results = this.search(query, this.data.length) // Get all results first
    
    // Apply filters
    results = this.applyFilters(results, filters)
    
    // Apply limit
    return results.slice(0, limit)
  }

  /**
   * Get search suggestions based on partial input
   */
  getSuggestions(partialQuery: string, limit: number = 10): string[] {
    if (!partialQuery.trim() || partialQuery.length < 2) {
      return []
    }

    const searchResults = this.search(partialQuery, limit)
    const suggestions = new Set<string>()
    
    searchResults.forEach(result => {
      // Add exact name matches
      if (result.item.name.toLowerCase().includes(partialQuery.toLowerCase())) {
        suggestions.add(result.item.name)
      }
      
      // Add common name matches
      result.item.common_names?.forEach(name => {
        if (name.toLowerCase().includes(partialQuery.toLowerCase())) {
          suggestions.add(name)
        }
      })
      
      // Add magical property matches
      result.item.magical_properties?.forEach(prop => {
        if (prop.toLowerCase().includes(partialQuery.toLowerCase())) {
          suggestions.add(prop.replace('_', ' '))
        }
      })
    })
    
    return Array.from(suggestions).slice(0, limit)
  }

  /**
   * Search within specific fields only
   */
  searchByField(
    query: string, 
    field: keyof Correspondence, 
    limit: number = 20
  ): SearchResult[] {
    if (!this.fuseInstance) return []
    
    const fieldOptions = {
      ...SEARCH_OPTIONS,
      keys: [{ name: field as keyof Correspondence, weight: 1 }]
    }
    
    const fieldFuse = new Fuse(this.data, fieldOptions)
    const results = fieldFuse.search(query, { limit })
    
    return results.map(result => ({
      item: result.item,
      score: result.score || 0,
      matches: [...(result.matches || [])],
      refIndex: result.refIndex
    }))
  }

  /**
   * Find similar correspondences based on magical properties
   */
  findSimilar(correspondence: Correspondence, limit: number = 10): SearchResult[] {
    if (!correspondence.magical_properties || correspondence.magical_properties.length === 0) {
      return []
    }
    
    // Create search query from magical properties
    const query = correspondence.magical_properties.join(' ')
    const results = this.search(query, limit + 1) // +1 to account for the item itself
    
    // Filter out the original correspondence
    return results.filter(result => result.item.id !== correspondence.id)
  }

  /**
   * Apply filters to search results
   */
  private applyFilters(
    results: SearchResult[], 
    filters: CorrespondenceFilters
  ): SearchResult[] {
    return results.filter(result => {
      const item = result.item
      
      if (filters.category && item.category !== filters.category) return false
      if (filters.element && item.element !== filters.element) return false
      if (filters.energy && item.energy_type !== filters.energy) return false
      if (filters.planet && item.planet !== filters.planet) return false
      if (filters.personalOnly && !item.is_personal) return false
      if (filters.favoritesOnly && !item.is_favorited) return false
      if (filters.verifiedOnly && !item.verified) return false
      
      if (filters.properties && filters.properties.length > 0) {
        const hasProperty = filters.properties.some(prop => 
          item.magical_properties.includes(prop)
        )
        if (!hasProperty) return false
      }
      
      return true
    })
  }

  /**
   * Generate hash for data to detect changes
   */
  private generateDataHash(data: Correspondence[]): string {
    const hashInput = data.map(item => `${item.id}-${item.updated_at}`).join('|')
    return btoa(hashInput).slice(0, 16) // Simple hash
  }

  /**
   * Get cached Fuse instance
   */
  private getCachedFuse(dataHash: string): CachedFuse | null {
    const cached = fuseCache.get(dataHash)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached
    }
    return null
  }

  /**
   * Cache Fuse instance
   */
  private cacheFuse(dataHash: string, fuse: Fuse<Correspondence>): void {
    const cachedFuse: CachedFuse = {
      fuse,
      timestamp: Date.now(),
      dataHash
    }
    fuseCache.set(dataHash, cachedFuse)
    
    // Clean old cache entries
    this.cleanCache()
  }

  /**
   * Clean expired cache entries
   */
  private cleanCache(): void {
    const now = Date.now()
    fuseCache.forEach((cached, key) => {
      if (now - cached.timestamp > CACHE_TTL) {
        fuseCache.delete(key)
      }
    })
  }

  /**
   * Get search statistics
   */
  getStats(): SearchStats {
    return {
      totalItems: this.data.length,
      indexSize: this.fuseInstance ? 'Built' : 'Not built',
      cacheSize: fuseCache.size,
      dataHash: this.dataHash
    }
  }
}

// Types
export interface SearchResult {
  item: Correspondence
  score: number
  matches: any[]
  refIndex: number
}

export interface CorrespondenceFilters {
  category?: string
  element?: string
  energy?: 'masculine' | 'feminine'
  planet?: string
  properties?: string[]
  personalOnly?: boolean
  favoritesOnly?: boolean
  verifiedOnly?: boolean
}

export interface SearchStats {
  totalItems: number
  indexSize: string
  cacheSize: number
  dataHash: string
}

// Singleton instance for global use
let globalSearchInstance: CorrespondenceSearch | null = null

/**
 * Get or create global search instance
 */
export function getCorrespondenceSearch(
  correspondences?: Correspondence[]
): CorrespondenceSearch {
  if (!globalSearchInstance) {
    globalSearchInstance = new CorrespondenceSearch(correspondences)
  } else if (correspondences) {
    globalSearchInstance.updateData(correspondences)
  }
  
  return globalSearchInstance
}

/**
 * Reset global search instance
 */
export function resetCorrespondenceSearch(): void {
  globalSearchInstance = null
  fuseCache.clear()
}

/**
 * Utility function for quick search
 */
export function quickSearch(
  correspondences: Correspondence[],
  query: string,
  limit: number = 20
): SearchResult[] {
  const search = getCorrespondenceSearch(correspondences)
  return search.search(query, limit)
}

/**
 * Search suggestions for autocomplete
 */
export function getSearchSuggestions(
  correspondences: Correspondence[],
  partialQuery: string,
  limit: number = 8
): string[] {
  const search = getCorrespondenceSearch(correspondences)
  return search.getSuggestions(partialQuery, limit)
}