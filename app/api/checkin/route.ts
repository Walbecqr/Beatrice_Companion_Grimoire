import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getMoonPhase } from '@/lib/utils/moon-phase'

// Daily check-in prompts pool
const DAILY_PROMPTS = [
  // Morning Reflections
  "Good morning, dear one. What intentions are you setting for this blessed day?",
  "As the sun rises, what energy do you wish to cultivate today?",
  "What are three things you're grateful for as you begin this new day?",
  
  // Emotional Check-ins
  "Take a moment to check in with your heart. What emotions are present within you right now?",
  "How is your spirit feeling today? What does your soul need?",
  "What would bring you peace and joy in this moment?",
  
  // Moon Phase Specific
  "The {moonPhase} invites us to {moonMessage}. How does this resonate with you today?",
  "Under this {moonPhase}, what are you ready to {moonAction}?",
  
  // Spiritual Practice
  "What spiritual practices are calling to you today?",
  "How can you honor your sacred path in today's activities?",
  "What signs or synchronicities have you noticed recently?",
  
  // Evening Reflections
  "As the day winds down, what moments brought you the most light?",
  "What lessons did today bring to your spiritual journey?",
  "Before you rest, what are you ready to release?",
  
  // General Wisdom
  "What wisdom is your intuition sharing with you right now?",
  "If your higher self had a message for you today, what would it be?",
  "What area of your life is asking for magical attention?",
];

// Moon phase specific actions and messages
const MOON_MESSAGES = {
  'New Moon': { message: 'plant new seeds of intention', action: 'begin' },
  'Waxing Crescent': { message: 'nurture your growing dreams', action: 'commit to' },
  'First Quarter': { message: 'take decisive action', action: 'pursue' },
  'Waxing Gibbous': { message: 'refine and adjust your path', action: 'perfect' },
  'Full Moon': { message: 'celebrate and release', action: 'release' },
  'Waning Gibbous': { message: 'share your wisdom', action: 'give thanks for' },
  'Last Quarter': { message: 'let go and forgive', action: 'release' },
  'Waning Crescent': { message: 'rest and reflect', action: 'surrender' },
}

function getTimeBasedPrompt(): string {
  const hour = new Date().getHours()
  const moonPhase = getMoonPhase(new Date()).replace(/[🌑🌒🌓🌔🌕🌖🌗🌘]/g, '').trim()
  
  let promptPool: string[] = []
  
  // Time-based selection
  if (hour >= 5 && hour < 12) {
    // Morning prompts
    promptPool = DAILY_PROMPTS.filter((_, i) => i < 3)
  } else if (hour >= 17 && hour < 22) {
    // Evening prompts
    promptPool = DAILY_PROMPTS.filter((_, i) => i >= 10 && i <= 12)
  } else {
    // General prompts
    promptPool = DAILY_PROMPTS.filter((_, i) => i >= 3 && i < 10)
  }
  
  // Add moon-specific prompts
  const moonData = MOON_MESSAGES[moonPhase as keyof typeof MOON_MESSAGES]
  if (moonData) {
    promptPool.push(
      DAILY_PROMPTS[6].replace('{moonPhase}', moonPhase).replace('{moonMessage}', moonData.message),
      DAILY_PROMPTS[7].replace('{moonPhase}', moonPhase).replace('{moonAction}', moonData.action)
    )
  }
  
  // Select random prompt from pool
  return promptPool[Math.floor(Math.random() * promptPool.length)]
}

export async function GET(request: Request) {
  try {
    const supabase = createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user already has a check-in for today
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString()
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString()

    const { data: existingCheckin } = await supabase
      .from('daily_checkins')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', startOfDay)
      .lt('created_at', endOfDay)
      .single()

    if (existingCheckin) {
      return NextResponse.json({ checkin: existingCheckin })
    }

    // Create new check-in for today
    const prompt = getTimeBasedPrompt()
    const { data: newCheckin, error: createError } = await supabase
      .from('daily_checkins')
      .insert({
        user_id: user.id,
        prompt: prompt,
        completed: false,
      })
      .select()
      .single()

    if (createError) throw createError

    return NextResponse.json({ checkin: newCheckin })
  } catch (error: any) {
    console.error('Check-in API error:', error)
    
    // Check for RSC errors
    const errorMessage = error.message || ''
    const errorStack = error.stack || ''
    const isRscError = 
      errorMessage.includes('_rsc') || 
      errorStack.includes('_rsc') || 
      errorMessage.includes('ERR_ABORTED') ||
      errorStack.includes('ERR_ABORTED')
    
    if (isRscError) {
      console.log('Detected RSC error in checkin GET API:', errorMessage)
      return NextResponse.json(
        { error: 'A React Server Component error occurred. Please refresh the page and try again.' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { checkinId, response, sessionId } = await request.json()
    
    const supabase = createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Update the check-in with response and session reference
    const updateData: Record<string, any> = {
      response: response,
      completed: true,
    }
    if (sessionId) {
      updateData.session_id = sessionId
    }

    const { data, error } = await supabase
      .from('daily_checkins')
      .update(updateData)
      .eq('id', checkinId)
      .eq('user_id', user.id) // Ensure user owns this check-in
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ checkin: data })
  } catch (error: any) {
    console.error('Check-in update error:', error)
    
    // Check for RSC errors
    const errorMessage = error.message || ''
    const errorStack = error.stack || ''
    const isRscError = 
      errorMessage.includes('_rsc') || 
      errorStack.includes('_rsc') || 
      errorMessage.includes('ERR_ABORTED') ||
      errorStack.includes('ERR_ABORTED')
    
    if (isRscError) {
      console.log('Detected RSC error in checkin POST API:', errorMessage)
      return NextResponse.json(
        { error: 'A React Server Component error occurred. Please refresh the page and try again.' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
