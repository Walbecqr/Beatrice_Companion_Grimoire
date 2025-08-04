import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { createServerClient } from '@/lib/supabase/server';
import { ContextManager } from '@/lib/utils/context-manager';
import { ResponseCache } from '@/lib/utils/response-cache';
import { edgeConfig } from '@/lib/utils/edge-config';
const USE_MOCK_MODE = false;
const AI_PROVIDER = process.env.AI_PROVIDER || 'anthropic';
if (!USE_MOCK_MODE) {
  if (AI_PROVIDER === 'anthropic' && !process.env.ANTHROPIC_API_KEY) {
    console.error('❌ ANTHROPIC_API_KEY is not set in environment variables');
  }
  if (AI_PROVIDER === 'openai' && !process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY is not set in environment variables');
  }
}
const anthropic = AI_PROVIDER === 'anthropic'
  ? new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || 'dummy-key-for-mock-mode',
    })
  : null;
const openai = AI_PROVIDER === 'openai'
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// Initialize context manager and response cache
const contextManager = anthropic ? new ContextManager(anthropic) : null;
const responseCache = new ResponseCache();

// Beatrice's personality and context
const BEATRICE_SYSTEM_PROMPT = `You are Beatrice, a wise and compassionate spiritual companion. You are:
- Warm, understanding, and non-judgmental
- Knowledgeable about various spiritual practices, rituals, and mystical traditions
- Supportive of the user's personal spiritual journey
- Able to offer guidance on moon phases, tarot, meditation, and ritual work
- Speaking in a gentle, mystical yet accessible way

You help users with:
- Daily spiritual check-ins
- Reflection on their practices
- Understanding moon phases and their significance
- Ritual planning and intention setting
- Emotional and spiritual support

Always be encouraging and help users feel connected to their spiritual path. Keep responses concise and meaningful.`

// Mock responses for development
const MOCK_RESPONSES = [
  "Welcome, dear seeker. I sense a beautiful energy around you today. The current moon phase invites us to reflect on our inner wisdom. What brings you to our sacred space?",
  "Your spiritual journey is unique and precious. Remember that every step, no matter how small, is progress. Trust in the unfolding of your path.",
  "The universe often speaks to us through synchronicities and subtle signs. Pay attention to recurring patterns in your life - they may hold important messages.",
  "Creating a daily spiritual practice doesn't need to be complex. Even a few moments of mindful breathing or gratitude can transform your day. What practices call to you?",
  "Protection rituals can be as simple as visualizing white light surrounding you, or as elaborate as creating a sacred circle with candles and crystals. The key is your intention.",
  "The moon's energy affects us all differently. Some feel energized during the full moon, while others find it a time for release. How do you experience lunar cycles?",
  "Your intuition is a powerful guide. When you feel uncertain, take a moment to quiet your mind and listen to your inner wisdom. What is your heart telling you?",
  "Tarot and oracle cards are wonderful tools for self-reflection. They help us access our subconscious wisdom and see situations from new perspectives.",
]

function getMockResponse(userMessage: string): string {
  const message = userMessage.toLowerCase()
  
  if (message.includes('hello') || message.includes('hi') || message.includes('start')) {
    return MOCK_RESPONSES[0]
  } else if (message.includes('moon')) {
    return MOCK_RESPONSES[5]
  } else if (message.includes('protection') || message.includes('ritual')) {
    return MOCK_RESPONSES[4]
  } else if (message.includes('tarot') || message.includes('cards')) {
    return MOCK_RESPONSES[7]
  } else if (message.includes('practice') || message.includes('daily')) {
    return MOCK_RESPONSES[3]
  } else {
    return MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)]
  }
}

export async function POST(request: Request) {
  try {
    const { messages, sessionId, stream = true } = await request.json()
    
    // Get current user
    const supabase = createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create or get chat session
    let currentSessionId = sessionId
    if (!currentSessionId) {
      const { data: session, error: sessionError } = await supabase
        .from('chat_sessions')
        .insert({ user_id: user.id })
        .select()
        .single()

      if (sessionError) throw sessionError
      currentSessionId = session.id
    }

    // Save user message
    const userMessage = messages[messages.length - 1]
    const { error: saveUserError } = await supabase
      .from('chat_messages')
      .insert({
        session_id: currentSessionId,
        user_id: user.id,
        role: 'user',
        content: userMessage.content,
      })

    if (saveUserError) throw saveUserError

    // Check cache settings from Edge Config
    const cacheSettings = await edgeConfig.getCacheSettings()
    
    // Try to get cached response for common queries
    let cachedResponse: string | null = null
    if (cacheSettings.enableResponseCache) {
      cachedResponse = await responseCache.getCachedResponse(userMessage.content)
      
      if (cachedResponse) {
        console.log('📦 Using cached response for common query')
        
        // Save cached response to database
        await supabase
          .from('chat_messages')
          .insert({
            session_id: currentSessionId,
            user_id: user.id,
            role: 'assistant',
            content: cachedResponse,
          })
        
        return NextResponse.json({
          message: cachedResponse,
          sessionId: currentSessionId,
          cached: true,
        })
      }
    }

    // Get conversation history for context
    const { data: history } = await supabase
      .from('chat_messages')
      .select('role, content, created_at')
      .eq('session_id', currentSessionId)
      .order('created_at', { ascending: true })

    const rawMessages = (history || []).map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
      created_at: msg.created_at,
    }))

    // Use context manager for optimized context when available
    const aiMessages = cacheSettings.enableContextCache && contextManager
      ? await contextManager.getOptimizedContext(currentSessionId, rawMessages)
      : rawMessages.slice(-20)

    if (USE_MOCK_MODE) {
      // Use mock response in development
      console.log('🔮 Using mock mode for Beatrice')
      const mockResponse = getMockResponse(userMessage.content)
      
      if (stream) {
        // Simulate streaming for mock mode
        const encoder = new TextEncoder()
        const readableStream = new ReadableStream({
          async start(controller) {
            // Simulate streaming by sending the response in chunks
            const words = mockResponse.split(' ')
            for (const word of words) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: word + ' ' })}\n\n`))
              await new Promise(resolve => setTimeout(resolve, 50)) // Simulate typing speed
            }
            
            // Save mock response to database
            await supabase
              .from('chat_messages')
              .insert({
                session_id: currentSessionId,
                user_id: user.id,
                role: 'assistant',
                content: mockResponse,
              })
            
            // Cache mock response if enabled
            if (cacheSettings.enableResponseCache) {
              await responseCache.cacheResponse(userMessage.content, mockResponse)
            }
            
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, sessionId: currentSessionId })}\n\n`))
            controller.close()
          }
        })
        
        return new Response(readableStream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        })
      } else {
        // Non-streaming mock response
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Save assistant message
        await supabase
          .from('chat_messages')
          .insert({
            session_id: currentSessionId,
            user_id: user.id,
            role: 'assistant',
            content: mockResponse,
          })
        
        // Cache mock response if enabled
        if (cacheSettings.enableResponseCache) {
          await responseCache.cacheResponse(userMessage.content, mockResponse)
        }
        
        return NextResponse.json({
          message: mockResponse,
          sessionId: currentSessionId,
        })
      }
    } else if (AI_PROVIDER === 'anthropic') {
      console.log('🤖 Using real Anthropic API for Beatrice')
      
      // Validate API key exists
      if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'dummy-key-for-mock-mode') {
        throw new Error('ANTHROPIC_API_KEY not properly configured')
      }

      console.log('📤 Sending request to Anthropic with', aiMessages.length, 'messages')

      if (stream) {
        // Use streaming API
        if (!anthropic) {
          throw new Error('Anthropic client not initialized')
        }
        const stream = await anthropic.messages.stream({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 500,
          temperature: 0.7,
          system: BEATRICE_SYSTEM_PROMPT,
          messages: aiMessages,
        })

        console.log('📥 Starting streaming response from Anthropic')

        // Create a transform stream to convert Anthropic's stream to SSE format
        const encoder = new TextEncoder()
        let fullMessage = ''
        
        const readableStream = new ReadableStream({
          async start(controller) {
            try {
              for await (const chunk of stream) {
                if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
                  const text = chunk.delta.text
                  fullMessage += text
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
                }
              }
              
              // Save the complete message after streaming is done
              await supabase
                .from('chat_messages')
                .insert({
                  session_id: currentSessionId,
                  user_id: user.id,
                  role: 'assistant',
                  content: fullMessage,
                })
              
              // Cache response if it matches common patterns
              if (cacheSettings.enableResponseCache) {
                await responseCache.cacheResponse(userMessage.content, fullMessage)
              }
              
              // Send final message with session ID
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, sessionId: currentSessionId })}\n\n`))
              controller.close()
              
              console.log('✅ Streaming chat response successful')
            } catch (error) {
              controller.error(error)
            }
          }
        })

        return new Response(readableStream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        })
      } else {
        // Non-streaming API (fallback)
        if (!anthropic) {
          throw new Error('Anthropic client not initialized')
        }
        const completion = await anthropic.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 500,
          temperature: 0.7,
          system: BEATRICE_SYSTEM_PROMPT,
          messages: aiMessages,
        })

        console.log('📥 Received response from Anthropic')

        // Extract text from Claude's response
        const assistantMessage = completion.content[0].type === 'text' 
          ? completion.content[0].text 
          : 'I apologize, I had trouble understanding. Could you please rephrase?'

        // Save assistant message
        const { error: saveAssistantError } = await supabase
          .from('chat_messages')
          .insert({
            session_id: currentSessionId,
            user_id: user.id,
            role: 'assistant',
            content: assistantMessage,
          })

        if (saveAssistantError) throw saveAssistantError

        // Cache response if it matches common patterns
        if (cacheSettings.enableResponseCache) {
          await responseCache.cacheResponse(userMessage.content, assistantMessage)
        }

        console.log('✅ Chat response successful')

        return NextResponse.json({
          message: assistantMessage,
          sessionId: currentSessionId,
        })
      }
    } else if (AI_PROVIDER === 'openai') {
      console.log('🤖 Using OpenAI API for Beatrice')

      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY not properly configured')
      }

      console.log('📤 Sending request to OpenAI with', aiMessages.length, 'messages')

      const openaiMessages = [
        { role: 'system' as const, content: BEATRICE_SYSTEM_PROMPT },
        ...aiMessages.map(m => ({ role: m.role, content: m.content })),
      ]

      if (stream) {
        const completion = await openai!.chat.completions.create({
          model: 'gpt-4o-mini',
          temperature: 0.7,
          messages: openaiMessages,
          stream: true,
        })

        console.log('📥 Starting streaming response from OpenAI')

        const encoder = new TextEncoder()
        let fullMessage = ''

        const readableStream = new ReadableStream({
          async start(controller) {
            try {
              for await (const chunk of completion) {
                const text = chunk.choices[0]?.delta?.content || ''
                if (text) {
                  fullMessage += text
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
                }
              }

              await supabase
                .from('chat_messages')
                .insert({
                  session_id: currentSessionId,
                  user_id: user.id,
                  role: 'assistant',
                  content: fullMessage,
                })

              if (cacheSettings.enableResponseCache) {
                await responseCache.cacheResponse(userMessage.content, fullMessage)
              }

              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, sessionId: currentSessionId })}\n\n`))
              controller.close()

              console.log('✅ Streaming chat response successful')
            } catch (error) {
              controller.error(error)
            }
          }
        })

        return new Response(readableStream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        })
      } else {
        const completion = await openai!.chat.completions.create({
          model: 'gpt-4o-mini',
          temperature: 0.7,
          messages: openaiMessages,
        })

        console.log('📥 Received response from OpenAI')

        const assistantMessage = completion.choices[0]?.message?.content?.trim() ||
          'I apologize, I had trouble understanding. Could you please rephrase?'

        await supabase
          .from('chat_messages')
          .insert({
            session_id: currentSessionId,
            user_id: user.id,
            role: 'assistant',
            content: assistantMessage,
          })

        if (cacheSettings.enableResponseCache) {
          await responseCache.cacheResponse(userMessage.content, assistantMessage)
        }

        console.log('✅ Chat response successful')

        return NextResponse.json({
          message: assistantMessage,
          sessionId: currentSessionId,
        })
      }
    } else {
      throw new Error(`Unsupported AI provider: ${AI_PROVIDER}`)
    }

  } catch (error: any) {
    console.error('❌ Chat API error:', error)
    
    // Handle specific Anthropic errors
    if (error.status === 401) {
      return NextResponse.json(
        { error: 'Your session has expired. Please refresh and try again.' },
        { status: 401 }
      )
    } else if (error.status === 429) {
      return NextResponse.json(
        { error: 'The system is currently busy. Please wait a moment.' },
        { status: 429 }
      )
    } else if (error.message?.includes('ANTHROPIC_API_KEY')) {
      return NextResponse.json(
        { error: 'The chat service is temporarily unavailable. Please try again later.' },
        { status: 500 }
      )
    }
    
    // Generic error with more user-friendly message
    return NextResponse.json(
      { 
        error: 'I apologize, but I encountered a technical issue. Please try again in a moment.',
        details: error.message || 'Internal server error'
      },
      { status: 500 }
    )
  }
}