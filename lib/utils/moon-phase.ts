// lib/utils/moon-phase.ts
import { 
  MOON_PHASE_LOOKUP, 
  MOON_PHASE_DATES, 
  PHASE_PATTERNS,
  PHASE_MEANINGS,
  MoonPhaseData 
} from './moon-phase-data'

// Cache for interpolated phases
const phaseCache = new Map<string, string>()
const detailedCache = new Map<string, MoonPhaseData>()

// Web Worker for complex calculations
let moonPhaseWorker: Worker | null = null

function initializeWorker(): Worker {
  if (!moonPhaseWorker && typeof Worker !== 'undefined') {
    moonPhaseWorker = new Worker('/workers/moon-phase-worker.js')
  }
  return moonPhaseWorker!
}

/**
 * Fast moon phase lookup using pre-calculated data
 * Falls back to calculation if date not in lookup table
 */
export function getMoonPhase(date: Date): string {
  const dateString = date.toISOString().split('T')[0]
  
  // Check cache first
  if (phaseCache.has(dateString)) {
    return phaseCache.get(dateString)!
  }
  
  // Try direct lookup for exact matches
  if (MOON_PHASE_LOOKUP[dateString]) {
    const result = `${MOON_PHASE_LOOKUP[dateString].emoji} ${MOON_PHASE_LOOKUP[dateString].phase}`
    phaseCache.set(dateString, result)
    return result
  }
  
  // Find nearest date using binary search
  const nearestPhase = findNearestPhase(dateString)
  if (nearestPhase) {
    const result = `${nearestPhase.emoji} ${nearestPhase.phase}`
    phaseCache.set(dateString, result)
    return result
  }
  
  // Fallback to calculation for dates outside our lookup range
  return calculateMoonPhaseFallback(date)
}

/**
 * Get detailed moon phase information
 */
export function getMoonPhaseDetailed(date: Date): MoonPhaseData {
  const dateString = date.toISOString().split('T')[0]
  
  // Check cache first
  if (detailedCache.has(dateString)) {
    return detailedCache.get(dateString)!
  }
  
  // Try direct lookup
  if (MOON_PHASE_LOOKUP[dateString]) {
    const result = { ...MOON_PHASE_LOOKUP[dateString] }
    detailedCache.set(dateString, result)
    return result
  }
  
  // Find nearest and interpolate
  const nearestPhase = findNearestPhase(dateString)
  if (nearestPhase) {
    const interpolated = interpolatePhaseData(date, nearestPhase)
    detailedCache.set(dateString, interpolated)
    return interpolated
  }
  
  // Fallback calculation
  return createPhaseDataFromCalculation(date)
}

/**
 * Binary search to find nearest pre-calculated phase
 */
function findNearestPhase(targetDate: string): MoonPhaseData | null {
  if (MOON_PHASE_DATES.length === 0) return null
  
  let left = 0
  let right = MOON_PHASE_DATES.length - 1
  let closest = MOON_PHASE_DATES[0]
  let closestDiff = Math.abs(new Date(targetDate).getTime() - new Date(closest).getTime())
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2)
    const current = MOON_PHASE_DATES[mid]
    const currentDiff = Math.abs(new Date(targetDate).getTime() - new Date(current).getTime())
    
    if (currentDiff < closestDiff) {
      closest = current
      closestDiff = currentDiff
    }
    
    if (current < targetDate) {
      left = mid + 1
    } else if (current > targetDate) {
      right = mid - 1
    } else {
      return MOON_PHASE_LOOKUP[current]
    }
  }
  
  // Return closest if within 3 days
  if (closestDiff <= 3 * 24 * 60 * 60 * 1000) {
    return MOON_PHASE_LOOKUP[closest]
  }
  
  return null
}

/**
 * Interpolate phase data for dates between known phases
 */
function interpolatePhaseData(date: Date, nearestPhase: MoonPhaseData): MoonPhaseData {
  const daysDiff = Math.abs(
    (date.getTime() - new Date(nearestPhase.date).getTime()) / (1000 * 60 * 60 * 24)
  )
  
  // Simple interpolation for illumination
  const illuminationAdjustment = Math.round(daysDiff * 3.4) // ~3.4% per day average
  let adjustedIllumination = nearestPhase.illumination
  
  if (date > new Date(nearestPhase.date)) {
    // Future date - adjust based on phase direction
    if (nearestPhase.ritualEnergy === 'growth' || nearestPhase.ritualEnergy === 'manifestation') {
      adjustedIllumination = Math.min(100, nearestPhase.illumination + illuminationAdjustment)
    } else {
      adjustedIllumination = Math.max(0, nearestPhase.illumination - illuminationAdjustment)
    }
  } else {
    // Past date
    if (nearestPhase.ritualEnergy === 'growth' || nearestPhase.ritualEnergy === 'manifestation') {
      adjustedIllumination = Math.max(0, nearestPhase.illumination - illuminationAdjustment)
    } else {
      adjustedIllumination = Math.min(100, nearestPhase.illumination + illuminationAdjustment)
    }
  }
  
  return {
    ...nearestPhase,
    date: date.toISOString().split('T')[0],
    illumination: Math.max(0, Math.min(100, adjustedIllumination)),
    moonAge: nearestPhase.moonAge + daysDiff
  }
}

/**
 * Fallback calculation for dates outside lookup table
 */
function calculateMoonPhaseFallback(date: Date): string {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  
  // Original calculation as fallback
  let jd = 367 * year - Math.floor(7 * (year + Math.floor((month + 9) / 12)) / 4) +
    Math.floor(275 * month / 9) + day + 1721013.5
  
  const moonAge = (jd - 2451550.1) % 29.530588853
  
  if (moonAge < 1.84566) return '🌑 New Moon'
  else if (moonAge < 5.53699) return '🌒 Waxing Crescent'
  else if (moonAge < 9.22831) return '🌓 First Quarter'
  else if (moonAge < 12.91963) return '🌔 Waxing Gibbous'
  else if (moonAge < 16.61096) return '🌕 Full Moon'
  else if (moonAge < 20.30228) return '🌖 Waning Gibbous'
  else if (moonAge < 23.99361) return '🌗 Last Quarter'
  else if (moonAge < 27.68493) return '🌘 Waning Crescent'
  else return '🌑 New Moon'
}

/**
 * Create phase data from calculation
 */
function createPhaseDataFromCalculation(date: Date): MoonPhaseData {
  const phaseString = calculateMoonPhaseFallback(date)
  const [emoji, ...phaseNameParts] = phaseString.split(' ')
  const phaseName = phaseNameParts.join(' ')
  
  // Estimate illumination and other properties
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  
  let jd = 367 * year - Math.floor(7 * (year + Math.floor((month + 9) / 12)) / 4) +
    Math.floor(275 * month / 9) + day + 1721013.5
  
  const moonAge = (jd - 2451550.1) % 29.530588853
  const illumination = Math.round((1 - Math.cos(2 * Math.PI * moonAge / 29.530588853)) / 2 * 100)
  
  let ritualEnergy: 'new-beginning' | 'growth' | 'manifestation' | 'release' = 'new-beginning'
  if (moonAge < 7.4) ritualEnergy = 'new-beginning'
  else if (moonAge < 14.8) ritualEnergy = 'growth'
  else if (moonAge < 22.1) ritualEnergy = 'manifestation'
  else ritualEnergy = 'release'
  
  return {
    date: date.toISOString().split('T')[0],
    phase: phaseName,
    emoji: emoji,
    illumination,
    moonAge,
    ritualEnergy
  }
}

/**
 * Get moon phase using Web Worker for complex calculations
 */
export async function getMoonPhaseAsync(date: Date): Promise<MoonPhaseData> {
  return new Promise((resolve, reject) => {
    // Try fast lookup first
    const fastResult = getMoonPhaseDetailed(date)
    if (MOON_PHASE_LOOKUP[date.toISOString().split('T')[0]]) {
      resolve(fastResult)
      return
    }
    
    // Use web worker for complex calculation
    try {
      const worker = initializeWorker()
      
      const timeout = setTimeout(() => {
        reject(new Error('Moon phase calculation timeout'))
      }, 5000)
      
      worker.onmessage = (e) => {
        clearTimeout(timeout)
        if (e.data.type === 'PHASE_CALCULATED') {
          resolve(e.data.data)
        } else if (e.data.type === 'ERROR') {
          reject(new Error(e.data.data.message))
        }
      }
      
      worker.postMessage({
        type: 'CALCULATE_SINGLE_PHASE',
        data: { date: date.toISOString() }
      })
    } catch (error) {
      // Fallback to synchronous calculation
      resolve(fastResult)
    }
  })
}

/**
 * Generate moon phase calendar using Web Worker
 */
export async function generateMoonCalendar(
  startDate: Date, 
  endDate: Date
): Promise<{ calendar: MoonPhaseData[], majorPhases: MoonPhaseData[] }> {
  return new Promise((resolve, reject) => {
    try {
      const worker = initializeWorker()
      
      const timeout = setTimeout(() => {
        reject(new Error('Calendar generation timeout'))
      }, 10000)
      
      worker.onmessage = (e) => {
        clearTimeout(timeout)
        if (e.data.type === 'CALENDAR_GENERATED') {
          resolve(e.data.data)
        } else if (e.data.type === 'ERROR') {
          reject(new Error(e.data.data.message))
        }
      }
      
      worker.postMessage({
        type: 'GENERATE_CALENDAR',
        data: { 
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
      })
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Find next occurrence of a specific moon phase
 */
export async function findNextMoonPhase(
  targetPhase: string,
  fromDate: Date = new Date()
): Promise<MoonPhaseData | null> {
  return new Promise((resolve, reject) => {
    try {
      const worker = initializeWorker()
      
      const timeout = setTimeout(() => {
        reject(new Error('Next phase search timeout'))
      }, 5000)
      
      worker.onmessage = (e) => {
        clearTimeout(timeout)
        if (e.data.type === 'NEXT_PHASE_FOUND') {
          resolve(e.data.data)
        } else if (e.data.type === 'ERROR') {
          reject(new Error(e.data.data.message))
        }
      }
      
      worker.postMessage({
        type: 'FIND_NEXT_PHASE',
        data: { 
          targetPhase,
          fromDate: fromDate.toISOString()
        }
      })
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Get spiritual meaning for a moon phase
 */
export function getMoonPhaseMeaning(phaseName: string) {
  return PHASE_MEANINGS[phaseName as keyof typeof PHASE_MEANINGS] || null
}

/**
 * Clear phase caches
 */
export function clearMoonPhaseCache() {
  phaseCache.clear()
  detailedCache.clear()
}