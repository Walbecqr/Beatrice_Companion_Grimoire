// lib/utils/moon-calendar.ts
import { startOfMonth, endOfMonth, eachDayOfInterval, format } from 'date-fns'

export interface MoonPhaseInfo {
  phase: string
  emoji: string
  illumination: number
  name: string
  energy: string
  ritualSuggestions: string[]
}

export const MOON_PHASES: Record<string, MoonPhaseInfo> = {
  'New Moon': {
    phase: 'New Moon',
    emoji: '🌑',
    illumination: 0,
    name: 'New Moon',
    energy: 'New beginnings, setting intentions, planting seeds',
    ritualSuggestions: [
      'Intention setting rituals',
      'New project blessings',
      'Cleansing and banishing',
      'Shadow work',
      'Vision boarding'
    ]
  },
  'Waxing Crescent': {
    phase: 'Waxing Crescent',
    emoji: '🌒',
    illumination: 25,
    name: 'Waxing Crescent',
    energy: 'Growth, attraction, building momentum',
    ritualSuggestions: [
      'Attraction spells',
      'Growth rituals',
      'Courage and strength work',
      'Setting plans in motion',
      'Prosperity magic'
    ]
  },
  'First Quarter': {
    phase: 'First Quarter',
    emoji: '🌓',
    illumination: 50,
    name: 'First Quarter',
    energy: 'Decision making, commitment, overcoming obstacles',
    ritualSuggestions: [
      'Decision-making rituals',
      'Obstacle removal',
      'Commitment ceremonies',
      'Protection spells',
      'Clarity divination'
    ]
  },
  'Waxing Gibbous': {
    phase: 'Waxing Gibbous',
    emoji: '🌔',
    illumination: 75,
    name: 'Waxing Gibbous',
    energy: 'Refinement, adjustment, perseverance',
    ritualSuggestions: [
      'Fine-tuning spells',
      'Gratitude rituals',
      'Patience and perseverance work',
      'Healing ceremonies',
      'Abundance rituals'
    ]
  },
  'Full Moon': {
    phase: 'Full Moon',
    emoji: '🌕',
    illumination: 100,
    name: 'Full Moon',
    energy: 'Culmination, power, release, divination',
    ritualSuggestions: [
      'Full moon water charging',
      'Major spellwork',
      'Divination and scrying',
      'Release rituals',
      'Celebration ceremonies',
      'Crystal charging'
    ]
  },
  'Waning Gibbous': {
    phase: 'Waning Gibbous',
    emoji: '🌖',
    illumination: 75,
    name: 'Waning Gibbous',
    energy: 'Gratitude, sharing wisdom, giving back',
    ritualSuggestions: [
      'Gratitude ceremonies',
      'Teaching and mentoring',
      'Wisdom sharing',
      'Forgiveness rituals',
      'Ancestor work'
    ]
  },
  'Last Quarter': {
    phase: 'Last Quarter',
    emoji: '🌗',
    illumination: 50,
    name: 'Last Quarter',
    energy: 'Release, forgiveness, breaking patterns',
    ritualSuggestions: [
      'Banishing rituals',
      'Cord cutting',
      'Breaking bad habits',
      'Forgiveness work',
      'Space clearing'
    ]
  },
  'Waning Crescent': {
    phase: 'Waning Crescent',
    emoji: '🌘',
    illumination: 25,
    name: 'Waning Crescent',
    energy: 'Rest, reflection, preparation for renewal',
    ritualSuggestions: [
      'Rest and restoration',
      'Dream work',
      'Meditation and reflection',
      'Planning for the future',
      'Spiritual cleansing'
    ]
  }
}

export function getMoonPhaseForDate(date: Date): MoonPhaseInfo {
  // Calculate moon phase based on lunar cycle
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  
  // Convert date to Julian date
  let jd = 367 * year - Math.floor(7 * (year + Math.floor((month + 9) / 12)) / 4) +
    Math.floor(275 * month / 9) + day + 1721013.5
  
  // Calculate moon age
  const moonAge = (jd - 2451550.1) % 29.530588853
  
  // Determine phase based on moon age
  let phaseName: string
  if (moonAge < 1.84566) phaseName = 'New Moon'
  else if (moonAge < 5.53699) phaseName = 'Waxing Crescent'
  else if (moonAge < 9.22831) phaseName = 'First Quarter'
  else if (moonAge < 12.91963) phaseName = 'Waxing Gibbous'
  else if (moonAge < 16.61096) phaseName = 'Full Moon'
  else if (moonAge < 20.30228) phaseName = 'Waning Gibbous'
  else if (moonAge < 23.99361) phaseName = 'Last Quarter'
  else if (moonAge < 27.68493) phaseName = 'Waning Crescent'
  else phaseName = 'New Moon'
  
  return MOON_PHASES[phaseName]
}

export function getMonthMoonPhases(year: number, month: number) {
  const start = startOfMonth(new Date(year, month))
  const end = endOfMonth(new Date(year, month))
  const days = eachDayOfInterval({ start, end })
  
  return days.map(date => ({
    date,
    moonPhase: getMoonPhaseForDate(date)
  }))
}

export function getUpcomingMoonPhases(days: number = 30) {
  const today = new Date()
  const dates = []
  
  for (let i = 0; i < days; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    dates.push({
      date,
      moonPhase: getMoonPhaseForDate(date)
    })
  }
  
  // Find significant phases (New, First Quarter, Full, Last Quarter)
  const significantPhases = dates.filter(({ moonPhase }) => 
    ['New Moon', 'First Quarter', 'Full Moon', 'Last Quarter'].includes(moonPhase.phase)
  )
  
  // Group consecutive days of the same phase and take the middle one
  const grouped: typeof significantPhases = []
  let currentGroup: typeof significantPhases = []
  
  significantPhases.forEach((item, index) => {
    if (currentGroup.length === 0 || currentGroup[0].moonPhase.phase === item.moonPhase.phase) {
      currentGroup.push(item)
    } else {
      // Add the middle date of the group
      grouped.push(currentGroup[Math.floor(currentGroup.length / 2)])
      currentGroup = [item]
    }
    
    // Don't forget the last group
    if (index === significantPhases.length - 1 && currentGroup.length > 0) {
      grouped.push(currentGroup[Math.floor(currentGroup.length / 2)])
    }
  })
  
  return grouped
}