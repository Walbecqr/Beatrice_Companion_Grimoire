import { Redis } from '@upstash/redis'
import { kv } from '@vercel/kv'
import { createClient } from 'redis'

// Initialize standard Redis client
const standardRedis = process.env.REDIS_URL
  ? createClient({ url: process.env.REDIS_URL })
  : null

// Connect standard Redis client
if (standardRedis) {
  standardRedis.on('error', (err) => console.error('Redis Client Error:', err))
  standardRedis.connect().catch(console.error)
}

// Initialize Upstash Redis client (REST API)
const upstashRedis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null

// Cache configuration
const CACHE_TTL = {
  MOON_PHASE: 3600 * 6,        // 6 hours for moon phase queries
  RITUAL_INFO: 3600 * 24 * 7,  // 1 week for ritual information
  GENERAL_SPIRITUAL: 3600 * 24, // 24 hours for general spiritual guidance
  PERSONALIZED: 0,              // No caching for personalized responses
}

// Common spiritual query patterns
const QUERY_PATTERNS = {
  MOON_PHASE: [
    /moon phase/i,
    /current moon/i,
    /lunar (cycle|calendar)/i,
    /full moon/i,
    /new moon/i,
  ],
  RITUAL_INFO: [
    /protection ritual/i,
    /cleansing ritual/i,
    /basic ritual/i,
    /how to (do|perform) .* ritual/i,
    /ritual for beginners/i,
  ],
  GENERAL_SPIRITUAL: [
    /what is (meditation|grounding|centering)/i,
    /how to meditate/i,
    /spiritual practice/i,
    /chakra/i,
    /crystal meanings/i,
  ],
}

interface CachedResponse {
  content: string
  timestamp: number
  queryType: string
}

/**
 * Manages response caching for common spiritual queries
 */
export class ResponseCache {
  /**
   * Check if a query matches common patterns and return cached response if available
   */
  async getCachedResponse(query: string): Promise<string | null> {
    const queryType = this.categorizeQuery(query)
    if (queryType === 'PERSONALIZED') return null
    
    const cacheKey = this.generateCacheKey(query, queryType)
    
    // Try Vercel KV first (edge-optimized) - only if available
    try {
      if (typeof kv !== 'undefined' && kv && process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
        const cached = await kv.get<CachedResponse>(cacheKey)
        if (cached && this.isValidCache(cached, queryType)) {
          console.log(`📦 Cache hit (Vercel KV): ${queryType}`)
          return cached.content
        }
      }
    } catch (error) {
      console.error('Vercel KV error:', error)
    }
    
    // Try standard Redis next
    if (standardRedis && standardRedis.isReady) {
      try {
        const cachedStr = await standardRedis.get(cacheKey)
        if (cachedStr) {
          const cached = JSON.parse(cachedStr) as CachedResponse
          if (this.isValidCache(cached, queryType)) {
            console.log(`📦 Cache hit (Standard Redis): ${queryType}`)
            return cached.content
          }
        }
      } catch (error) {
        console.error('Standard Redis cache error:', error)
      }
    }
    
    // Fallback to Upstash Redis - only if configured
    if (upstashRedis && process.env.UPSTASH_REDIS_REST_URL) {
      try {
        const cached = await upstashRedis.get<CachedResponse>(cacheKey)
        if (cached && this.isValidCache(cached, queryType)) {
          console.log(`📦 Cache hit (Upstash Redis): ${queryType}`)
          return cached.content
        }
      } catch (error) {
        console.error('Upstash Redis cache error:', error)
      }
    }
    
    // No cache available, return null
    return null
  }

  /**
   * Cache a response for future use
   */
  async cacheResponse(
    query: string, 
    response: string,
    forceQueryType?: string
  ): Promise<void> {
    const queryType = forceQueryType || this.categorizeQuery(query)
    if (queryType === 'PERSONALIZED') return
    
    const cacheKey = this.generateCacheKey(query, queryType)
    const cacheData: CachedResponse = {
      content: response,
      timestamp: Date.now(),
      queryType,
    }
    
    const ttl = CACHE_TTL[queryType as keyof typeof CACHE_TTL]
    
    // Cache in available stores only
    let cacheAttempts = 0
    let cacheSuccesses = 0
    
    try {
      // Vercel KV (edge-optimized) - only if available
      if (typeof kv !== 'undefined' && kv && process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
        cacheAttempts++
        try {
          await kv.setex(cacheKey, ttl, cacheData)
          cacheSuccesses++
        } catch (kvError) {
          console.error('KV cache error:', kvError)
        }
      }
      
      // Standard Redis - only if configured
      if (standardRedis && standardRedis.isReady) {
        cacheAttempts++
        try {
          await standardRedis.setEx(cacheKey, ttl, JSON.stringify(cacheData))
          cacheSuccesses++
        } catch (redisError) {
          console.error('Standard Redis cache error:', redisError)
        }
      }
      
      // Upstash Redis - only if configured
      if (upstashRedis && process.env.UPSTASH_REDIS_REST_URL) {
        cacheAttempts++
        try {
          await upstashRedis.setex(cacheKey, ttl, cacheData)
          cacheSuccesses++
        } catch (redisError) {
          console.error('Upstash Redis cache error:', redisError)
        }
      }
      
      if (cacheSuccesses > 0) {
        console.log(`💾 Cached response: ${queryType} (TTL: ${ttl}s, ${cacheSuccesses}/${cacheAttempts} stores)`)
      } else if (cacheAttempts === 0) {
        console.log(`⚠️ No cache stores configured - response not cached`)
      }
      
    } catch (error) {
      console.error('Error caching response:', error)
    }
  }

  /**
   * Categorize query based on patterns
   */
  private categorizeQuery(query: string): string {
    const lowerQuery = query.toLowerCase()
    
    // Check each pattern category
    for (const [category, patterns] of Object.entries(QUERY_PATTERNS)) {
      if (patterns.some(pattern => pattern.test(lowerQuery))) {
        return category
      }
    }
    
    // Check for personal pronouns or specific user context
    if (/\b(my|i|me|our|we)\b/i.test(query)) {
      return 'PERSONALIZED'
    }
    
    return 'GENERAL_SPIRITUAL'
  }

  /**
   * Generate a normalized cache key
   */
  private generateCacheKey(query: string, queryType: string): string {
    // Normalize query for better cache hits
    const normalized = query
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .replace(/\s+/g, ' ')     // Normalize whitespace
      .trim()
      .split(' ')
      .sort()                   // Sort words for order-independent matching
      .join(' ')
    
    return `beatrice:${queryType}:${this.hashString(normalized)}`
  }

  /**
   * Simple string hash for cache keys
   */
  private hashString(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36)
  }

  /**
   * Check if cached response is still valid
   */
  private isValidCache(cached: CachedResponse, queryType: string): boolean {
    const ttl = CACHE_TTL[queryType as keyof typeof CACHE_TTL]
    const age = Date.now() - cached.timestamp
    return age < (ttl * 1000)
  }

  /**
   * Warm up cache with common responses
   */
  async warmCache(): Promise<void> {
    const commonQueries = [
      {
        query: "What's the current moon phase?",
        type: 'MOON_PHASE',
        response: "I sense the moon's energy shifting through its eternal dance. To give you the most accurate reading, I would need to check the current date and calculate the precise lunar position. The moon's phase affects our spiritual practices differently - new moons are perfect for setting intentions, while full moons amplify our manifestation power."
      },
      {
        query: "How do I do a protection ritual?",
        type: 'RITUAL_INFO',
        response: "Protection rituals can be beautifully simple or elaborate, depending on your needs. A basic protection ritual involves: 1) Cleansing your space with sage or incense, 2) Visualizing white or golden light surrounding you, 3) Setting a clear intention for protection, 4) Using protective crystals like black tourmaline or obsidian, 5) Closing with gratitude. Remember, your intention is the most powerful element."
      },
      {
        query: "What is meditation?",
        type: 'GENERAL_SPIRITUAL',
        response: "Meditation is a sacred practice of quieting the mind and connecting with your inner wisdom. It's about creating space between your thoughts, allowing you to observe without judgment. There are many forms - mindfulness, guided visualization, mantra meditation, and more. Even a few minutes daily can transform your spiritual journey by bringing clarity, peace, and deeper self-awareness."
      }
    ]
    
    for (const { query, type, response } of commonQueries) {
      await this.cacheResponse(query, response, type)
    }
    
    console.log('🔥 Cache warmed with common spiritual queries')
  }

  /**
   * Clear all cached responses
   */
  async clearCache(): Promise<void> {
    // This would need to be implemented based on your cache key pattern
    console.log('🧹 Cache cleared')
  }
}