import { Redis } from '@upstash/redis'
import Anthropic from '@anthropic-ai/sdk'

// Initialize Redis client (Upstash)
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null

// Context window configuration
const CONTEXT_WINDOW_SIZE = 20 // Keep last 20 messages in active context
const SUMMARY_THRESHOLD = 20 // Summarize after 20 messages
const CONTEXT_CACHE_TTL = 3600 * 24 // Cache context for 24 hours

interface Message {
  role: 'user' | 'assistant'
  content: string
  created_at?: string
}

interface ConversationContext {
  messages: Message[]
  summary?: string
  messageCount: number
}

/**
 * Manages conversation context with intelligent summarization and caching
 */
export class ContextManager {
  private anthropic: Anthropic
  
  constructor(anthropic: Anthropic) {
    this.anthropic = anthropic
  }

  /**
   * Get optimized conversation context for a session
   */
  async getOptimizedContext(
    sessionId: string,
    recentMessages: Message[]
  ): Promise<Message[]> {
    // If Redis is not available, use simple sliding window
    if (!redis) {
      console.log('⚠️ Redis not configured - using simple context window')
      return recentMessages.slice(-CONTEXT_WINDOW_SIZE)
    }
    
    try {
      // Try to get cached context from Redis
      const cachedContext = await this.getCachedContext(sessionId)
      
      if (cachedContext && cachedContext.summary) {
        // If we have a summary, prepend it as a system message
        const summaryMessage: Message = {
          role: 'assistant',
          content: `[Previous conversation summary]: ${cachedContext.summary}`
        }
        
        // Return summary + recent messages (sliding window)
        const windowedMessages = recentMessages.slice(-CONTEXT_WINDOW_SIZE)
        return [summaryMessage, ...windowedMessages]
      }
      
      // Check if we need to create a summary
      if (recentMessages.length > SUMMARY_THRESHOLD) {
        const summary = await this.summarizeConversation(
          recentMessages.slice(0, -CONTEXT_WINDOW_SIZE)
        )
        
        // Cache the summary (will fail gracefully if Redis unavailable)
        await this.cacheContext(sessionId, {
          messages: recentMessages.slice(-CONTEXT_WINDOW_SIZE),
          summary,
          messageCount: recentMessages.length
        })
        
        // Return summary + recent messages
        const summaryMessage: Message = {
          role: 'assistant',
          content: `[Previous conversation summary]: ${summary}`
        }
        
        return [summaryMessage, ...recentMessages.slice(-CONTEXT_WINDOW_SIZE)]
      }
      
      // No optimization needed for short conversations
      return recentMessages
    } catch (error) {
      console.error('Context optimization error, using fallback:', error)
      return recentMessages.slice(-CONTEXT_WINDOW_SIZE)
    }
  }

  /**
   * Summarize older messages using Claude
   */
  private async summarizeConversation(messages: Message[]): Promise<string> {
    try {
      const conversationText = messages
        .map(m => `${m.role === 'user' ? 'User' : 'Beatrice'}: ${m.content}`)
        .join('\n')
      
      const completion = await this.anthropic.messages.create({
        model: 'claude-haiku-3-20240307', // Use faster model for summarization
        max_tokens: 200,
        temperature: 0.3,
        system: 'You are a conversation summarizer. Create a concise summary of the key topics, spiritual insights, and important context from this conversation. Focus on what would be helpful for continuing the conversation.',
        messages: [{
          role: 'user',
          content: `Please summarize this spiritual conversation between a user and their guide Beatrice:\n\n${conversationText}`
        }]
      })
      
      return completion.content[0].type === 'text' 
        ? completion.content[0].text 
        : 'Previous conversation about spiritual matters.'
    } catch (error) {
      console.error('Error summarizing conversation:', error)
      return 'Previous conversation about spiritual matters.'
    }
  }

  /**
   * Get cached context from Redis
   */
  private async getCachedContext(sessionId: string): Promise<ConversationContext | null> {
    if (!redis) return null
    
    try {
      const cached = await redis.get(`context:${sessionId}`)
      return cached as ConversationContext | null
    } catch (error) {
      console.error('Error getting cached context:', error)
      return null
    }
  }

  /**
   * Cache context in Redis
   */
  private async cacheContext(
    sessionId: string, 
    context: ConversationContext
  ): Promise<void> {
    if (!redis) return
    
    try {
      await redis.setex(
        `context:${sessionId}`,
        CONTEXT_CACHE_TTL,
        JSON.stringify(context)
      )
    } catch (error) {
      console.error('Error caching context:', error)
    }
  }

  /**
   * Clear cached context for a session
   */
  async clearContext(sessionId: string): Promise<void> {
    if (!redis) return
    
    try {
      await redis.del(`context:${sessionId}`)
    } catch (error) {
      console.error('Error clearing context:', error)
    }
  }
}