export function getMoonPhase(date: Date): string {
  // Calculate moon phase based on lunar cycle (simplified calculation)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  
  // Convert date to Julian date
  const jd = 367 * year - Math.floor(7 * (year + Math.floor((month + 9) / 12)) / 4) +
    Math.floor(275 * month / 9) + day + 1721013.5
  
  // Calculate moon age
  const moonAge = (jd - 2451550.1) % 29.530588853
  
  // Determine phase based on moon age
  if (moonAge < 1.84566) return '🌑 New Moon'
  if (moonAge < 5.53699) return '🌒 Waxing Crescent'
  if (moonAge < 9.22831) return '🌓 First Quarter'
  if (moonAge < 12.91963) return '🌔 Waxing Gibbous'
  if (moonAge < 16.61096) return '🌕 Full Moon'
  if (moonAge < 20.30228) return '🌖 Waning Gibbous'
  if (moonAge < 23.99361) return '🌗 Last Quarter'
  if (moonAge < 27.68493) return '🌘 Waning Crescent'
  return '🌑 New Moon'
}

export function getMoonPhaseEmoji(phase: string): string {
  const phaseMap: { [key: string]: string } = {
    'New Moon': '🌑',
    'Waxing Crescent': '🌒',
    'First Quarter': '🌓',
    'Waxing Gibbous': '🌔',
    'Full Moon': '🌕',
    'Waning Gibbous': '🌖',
    'Last Quarter': '🌗',
    'Waning Crescent': '🌘'
  }
  
  return phaseMap[phase] || '🌑'
}