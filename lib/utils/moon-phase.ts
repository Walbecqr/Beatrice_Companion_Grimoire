// lib/utils/moon-phase.ts
export function getMoonPhase(date: Date): string {
  // Calculate moon phase based on lunar cycle
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  
  // Convert date to Julian date
  let jd = 367 * year - Math.floor(7 * (year + Math.floor((month + 9) / 12)) / 4) +
    Math.floor(275 * month / 9) + day + 1721013.5
  
  // Calculate moon age
  const moonAge = (jd - 2451550.1) % 29.530588853
  
  // Determine phase based on moon age and return emoji + name
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