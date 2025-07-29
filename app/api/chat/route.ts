import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createServerClient } from '@/lib/supabase/server'

// Enable mock mode for development (set to false when you have Anthropic credits)
const USE_MOCK_MODE = false

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'dummy-key-for-mock-mode',
})

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
    const { messages, sessionId } = await request.json()
    
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

    let assistantMessage: string

    if (USE_MOCK_MODE) {
      // Use mock response in development
      console.log('🔮 Using mock mode for Beatrice')
      assistantMessage = getMockResponse(userMessage.content)
      
      // Add a small delay to simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
    } else {
      // Get conversation history for context
      const { data: history } = await supabase
        .from('chat_messages')
        .select('role, content')
        .eq('session_id', currentSessionId)
        .order('created_at', { ascending: true })
        .limit(20) // Keep last 20 messages for context

      // Convert messages to Claude format
      const claudeMessages = (history || []).map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }))

      // Get response from Claude
      const completion = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307', // Fast and affordable model
        max_tokens: 500,
        temperature: 0.7,
        system: BEATRICE_SYSTEM_PROMPT,
        messages: claudeMessages,
      })

      // Extract text from Claude's response
      assistantMessage = completion.content[0].type === 'text' 
        ? completion.content[0].text 
        : 'I apologize, I had trouble understanding. Could you please rephrase?'
    }

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

    return NextResponse.json({
      message: assistantMessage,
      sessionId: currentSessionId,
    })

  } catch (error: any) {
    console.error('Chat API error:', error)
    
    // Handle specific Anthropic errors
    if (error.status === 401) {
      return NextResponse.json(
        { error: 'Invalid Anthropic API key. Please check your environment variables.' },
        { status: 500 }
      )
    } else if (error.status === 429) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}