import { get } from '@vercel/edge-config'

// Edge Config keys for spiritual data
export const EDGE_CONFIG_KEYS = {
  MOON_PHASES: 'moon_phases_2024',
  RITUAL_TEMPLATES: 'ritual_templates',
  CORRESPONDENCE_INDEX: 'correspondence_quick_lookup',
  SPIRITUAL_GUIDANCE: 'common_spiritual_guidance',
  CACHE_SETTINGS: 'cache_settings',
}

interface EdgeCacheSettings {
  enableResponseCache: boolean
  enableContextCache: boolean
  cacheWarmupEnabled: boolean
  maxCacheAge: number
}

interface MoonPhaseData {
  date: string
  phase: string
  illumination: number
  zodiacSign: string
  ritualSuggestions: string[]
}

interface RitualTemplate {
  id: string
  name: string
  type: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  description: string
  steps: string[]
  tools: string[]
  bestTiming: string
}

/**
 * Edge Config manager for fast, globally distributed spiritual data
 */
export class EdgeConfigManager {
  private static instance: EdgeConfigManager
  private cache: Map<string, any> = new Map()
  private cacheTimestamps: Map<string, number> = new Map()
  private readonly CACHE_DURATION = 300000 // 5 minutes local cache

  private constructor() {}

  static getInstance(): EdgeConfigManager {
    if (!EdgeConfigManager.instance) {
      EdgeConfigManager.instance = new EdgeConfigManager()
    }
    return EdgeConfigManager.instance
  }

  /**
   * Get cache settings from Edge Config
   */
  async getCacheSettings(): Promise<EdgeCacheSettings> {
    const cached = this.getFromLocalCache(EDGE_CONFIG_KEYS.CACHE_SETTINGS)
    if (cached) return cached

    try {
      // Check if Vercel Edge Config is available
      if (typeof get === 'undefined') {
        throw new Error('Edge Config not available')
      }
      
      const settings = await get<EdgeCacheSettings>(EDGE_CONFIG_KEYS.CACHE_SETTINGS)
      if (settings) {
        this.setLocalCache(EDGE_CONFIG_KEYS.CACHE_SETTINGS, settings)
        return settings
      }
    } catch (error) {
      console.error('Error fetching cache settings:', error)
    }

    // Default settings - disable cache features when Edge Config is unavailable
    return {
      enableResponseCache: false,
      enableContextCache: false,
      cacheWarmupEnabled: false,
      maxCacheAge: 86400, // 24 hours
    }
  }

  /**
   * Get moon phase data for a specific date range
   */
  async getMoonPhases(startDate: Date, endDate: Date): Promise<MoonPhaseData[]> {
    const cached = this.getFromLocalCache(EDGE_CONFIG_KEYS.MOON_PHASES)
    if (cached) {
      return cached.filter((phase: MoonPhaseData) => {
        const phaseDate = new Date(phase.date)
        return phaseDate >= startDate && phaseDate <= endDate
      })
    }

    try {
      const allPhases = await get<MoonPhaseData[]>(EDGE_CONFIG_KEYS.MOON_PHASES)
      if (allPhases) {
        this.setLocalCache(EDGE_CONFIG_KEYS.MOON_PHASES, allPhases)
        return allPhases.filter(phase => {
          const phaseDate = new Date(phase.date)
          return phaseDate >= startDate && phaseDate <= endDate
        })
      }
    } catch (error) {
      console.error('Error fetching moon phases:', error)
    }

    return []
  }

  /**
   * Get ritual templates by type or difficulty
   */
  async getRitualTemplates(
    filter?: { type?: string; difficulty?: string }
  ): Promise<RitualTemplate[]> {
    const cached = this.getFromLocalCache(EDGE_CONFIG_KEYS.RITUAL_TEMPLATES)
    if (cached) {
      return this.filterRituals(cached, filter)
    }

    try {
      const templates = await get<RitualTemplate[]>(EDGE_CONFIG_KEYS.RITUAL_TEMPLATES)
      if (templates) {
        this.setLocalCache(EDGE_CONFIG_KEYS.RITUAL_TEMPLATES, templates)
        return this.filterRituals(templates, filter)
      }
    } catch (error) {
      console.error('Error fetching ritual templates:', error)
    }

    return []
  }

  /**
   * Get quick correspondence lookups
   */
  async getCorrespondenceIndex(): Promise<Record<string, string[]>> {
    const cached = this.getFromLocalCache(EDGE_CONFIG_KEYS.CORRESPONDENCE_INDEX)
    if (cached) return cached

    try {
      const index = await get<Record<string, string[]>>(EDGE_CONFIG_KEYS.CORRESPONDENCE_INDEX)
      if (index) {
        this.setLocalCache(EDGE_CONFIG_KEYS.CORRESPONDENCE_INDEX, index)
        return index
      }
    } catch (error) {
      console.error('Error fetching correspondence index:', error)
    }

    return {}
  }

  /**
   * Get common spiritual guidance responses
   */
  async getSpiritualGuidance(topic: string): Promise<string | null> {
    const cached = this.getFromLocalCache(EDGE_CONFIG_KEYS.SPIRITUAL_GUIDANCE)
    if (cached && cached[topic]) {
      return cached[topic]
    }

    try {
      const guidance = await get<Record<string, string>>(EDGE_CONFIG_KEYS.SPIRITUAL_GUIDANCE)
      if (guidance) {
        this.setLocalCache(EDGE_CONFIG_KEYS.SPIRITUAL_GUIDANCE, guidance)
        return guidance[topic] || null
      }
    } catch (error) {
      console.error('Error fetching spiritual guidance:', error)
    }

    return null
  }

  /**
   * Filter ritual templates
   */
  private filterRituals(
    rituals: RitualTemplate[],
    filter?: { type?: string; difficulty?: string }
  ): RitualTemplate[] {
    if (!filter) return rituals

    return rituals.filter(ritual => {
      if (filter.type && ritual.type !== filter.type) return false
      if (filter.difficulty && ritual.difficulty !== filter.difficulty) return false
      return true
    })
  }

  /**
   * Get from local cache
   */
  private getFromLocalCache(key: string): any {
    const timestamp = this.cacheTimestamps.get(key)
    if (!timestamp || Date.now() - timestamp > this.CACHE_DURATION) {
      return null
    }
    return this.cache.get(key)
  }

  /**
   * Set local cache
   */
  private setLocalCache(key: string, value: any): void {
    this.cache.set(key, value)
    this.cacheTimestamps.set(key, Date.now())
  }

  /**
   * Clear local cache
   */
  clearCache(): void {
    this.cache.clear()
    this.cacheTimestamps.clear()
  }
}

// Export singleton instance
export const edgeConfig = EdgeConfigManager.getInstance()