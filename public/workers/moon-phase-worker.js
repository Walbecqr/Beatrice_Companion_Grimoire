// Moon Phase Web Worker for complex astronomical calculations
// Handles intensive calculations without blocking the main thread

// Advanced astronomical calculation functions
function calculatePreciseJulianDate(date) {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  
  // More precise Julian date calculation
  let a = Math.floor((14 - month) / 12)
  let y = year + 4800 - a
  let m = month + 12 * a - 3
  
  let jdn = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045
  
  // Add time fraction
  let dayFraction = (hour - 12) / 24 + minute / 1440 + second / 86400
  
  return jdn + dayFraction
}

function calculateMoonAge(julianDate) {
  // Reference new moon: January 6, 2000, 18:14 UTC
  const referenceNewMoon = 2451549.26 
  const synodicMonth = 29.530588853 // days
  
  const daysSinceReference = julianDate - referenceNewMoon
  const moonAge = daysSinceReference % synodicMonth
  
  return moonAge < 0 ? moonAge + synodicMonth : moonAge
}

function calculateIllumination(moonAge) {
  // Calculate illumination percentage based on moon age
  const normalizedAge = moonAge / 29.530588853
  const illumination = (1 - Math.cos(2 * Math.PI * normalizedAge)) / 2
  return Math.round(illumination * 100)
}

function calculateMoonPhase(moonAge) {
  const phases = [
    { name: 'New Moon', emoji: '🌑', min: 0, max: 1.84566 },
    { name: 'Waxing Crescent', emoji: '🌒', min: 1.84566, max: 5.53699 },
    { name: 'First Quarter', emoji: '🌓', min: 5.53699, max: 9.22831 },
    { name: 'Waxing Gibbous', emoji: '🌔', min: 9.22831, max: 12.91963 },
    { name: 'Full Moon', emoji: '🌕', min: 12.91963, max: 16.61096 },
    { name: 'Waning Gibbous', emoji: '🌖', min: 16.61096, max: 20.30228 },
    { name: 'Last Quarter', emoji: '🌗', min: 20.30228, max: 23.99361 },
    { name: 'Waning Crescent', emoji: '🌘', min: 23.99361, max: 27.68493 },
  ]
  
  for (const phase of phases) {
    if (moonAge >= phase.min && moonAge < phase.max) {
      return phase
    }
  }
  
  // Handle edge case (very end of cycle)
  return phases[0] // New Moon
}

function generateMoonPhaseCalendar(startDate, endDate) {
  const calendar = []
  const current = new Date(startDate)
  
  while (current <= endDate) {
    const julianDate = calculatePreciseJulianDate(current)
    const moonAge = calculateMoonAge(julianDate)
    const illumination = calculateIllumination(moonAge)
    const phase = calculateMoonPhase(moonAge)
    
    calendar.push({
      date: current.toISOString().split('T')[0],
      phase: phase.name,
      emoji: phase.emoji,
      moonAge: Math.round(moonAge * 100) / 100,
      illumination,
      julianDate: Math.round(julianDate * 1000) / 1000
    })
    
    current.setDate(current.getDate() + 1)
  }
  
  return calendar
}

function findMajorPhases(calendar) {
  const majorPhases = []
  let lastPhase = null
  
  for (const day of calendar) {
    // Detect phase transitions
    if (lastPhase && lastPhase !== day.phase) {
      // Check if this is a major phase (quarters and full/new)
      const majorPhaseNames = ['New Moon', 'First Quarter', 'Full Moon', 'Last Quarter']
      if (majorPhaseNames.includes(day.phase)) {
        majorPhases.push({
          ...day,
          isTransition: true,
          previousPhase: lastPhase
        })
      }
    }
    lastPhase = day.phase
  }
  
  return majorPhases
}

// Worker message handler
self.onmessage = function(e) {
  const { type, data } = e.data
  
  try {
    switch (type) {
      case 'CALCULATE_SINGLE_PHASE':
        const date = new Date(data.date)
        const julianDate = calculatePreciseJulianDate(date)
        const moonAge = calculateMoonAge(julianDate)
        const illumination = calculateIllumination(moonAge)
        const phase = calculateMoonPhase(moonAge)
        
        self.postMessage({
          type: 'PHASE_CALCULATED',
          data: {
            date: data.date,
            phase: phase.name,
            emoji: phase.emoji,
            moonAge: Math.round(moonAge * 100) / 100,
            illumination,
            julianDate: Math.round(julianDate * 1000) / 1000
          }
        })
        break
        
      case 'GENERATE_CALENDAR':
        const startDate = new Date(data.startDate)
        const endDate = new Date(data.endDate)
        const calendar = generateMoonPhaseCalendar(startDate, endDate)
        
        self.postMessage({
          type: 'CALENDAR_GENERATED',
          data: {
            calendar,
            majorPhases: findMajorPhases(calendar),
            dateRange: {
              start: data.startDate,
              end: data.endDate
            }
          }
        })
        break
        
      case 'FIND_NEXT_PHASE':
        const fromDate = new Date(data.fromDate)
        const targetPhase = data.targetPhase
        
        // Search for next occurrence of target phase (up to 60 days ahead)
        let searchDate = new Date(fromDate)
        let found = null
        
        for (let i = 0; i < 60; i++) {
          const jd = calculatePreciseJulianDate(searchDate)
          const age = calculateMoonAge(jd)
          const currentPhase = calculateMoonPhase(age)
          
          if (currentPhase.name === targetPhase) {
            found = {
              date: searchDate.toISOString().split('T')[0],
              phase: currentPhase.name,
              emoji: currentPhase.emoji,
              moonAge: Math.round(age * 100) / 100,
              illumination: calculateIllumination(age),
              daysFromNow: i
            }
            break
          }
          
          searchDate.setDate(searchDate.getDate() + 1)
        }
        
        self.postMessage({
          type: 'NEXT_PHASE_FOUND',
          data: found
        })
        break
        
      default:
        self.postMessage({
          type: 'ERROR',
          data: { message: 'Unknown message type' }
        })
    }
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      data: { message: error.message }
    })
  }
}