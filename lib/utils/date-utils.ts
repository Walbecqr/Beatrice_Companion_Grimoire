import { format, formatDistance, formatRelative, formatDistanceToNow } from 'date-fns'
export function formatDetailDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, 'PPpp') // Format: Apr 29, 2021, 1:25:50 PM
}
export function formatRelativeDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return formatRelative(dateObj, new Date())
}
export function formatTimeAgo(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return formatDistanceToNow(dateObj, { addSuffix: true })
  }
  try {
    let date: Date

    // Handle different input types
    if (typeof dateValue === 'string') {
      // Try parsing as ISO string first, then as regular Date
      date = dateValue.includes('T') ? parseISO(dateValue) : new Date(dateValue)
    } else if (dateValue instanceof Date) {
      date = dateValue
    } else {
      return fallback
    }

    // Check if the date is valid
    if (!isValid(date)) {
      console.warn('Invalid date value:', dateValue)
      return fallback
    }

    return format(date, formatStr)
  } catch (error) {
    console.error('Date formatting error:', error, 'Value:', dateValue)
    return fallback
  }
}

/**
 * Safely formats a relative date (e.g., "2 hours ago")
 * @param dateValue - Date string, Date object, or potentially invalid value
 * @param fallback - Fallback text when date is invalid
 * @returns Relative date string or fallback
 */
export function safeFormatRelativeDate(
  dateValue: string | Date | null | undefined,
  fallback: string = 'Unknown time'
): string {
  if (!dateValue) {
    return fallback
  }

  try {
    let date: Date

    if (typeof dateValue === 'string') {
      date = dateValue.includes('T') ? parseISO(dateValue) : new Date(dateValue)
    } else if (dateValue instanceof Date) {
      date = dateValue
    } else {
      return fallback
    }

    if (!isValid(date)) {
      return fallback
    }

    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    const diffInHours = Math.floor(diffInMinutes / 60)
    const diffInDays = Math.floor(diffInHours / 24)

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
    
    // For older dates, use regular formatting
    return format(date, 'MMM d, yyyy')
  } catch (error) {
    console.error('Relative date formatting error:', error, 'Value:', dateValue)
    return fallback
  }
}

/**
/**
 * Checks if a date value is valid
 * @param dateValue - Date string, Date object, or potentially invalid value
 * @returns boolean indicating if the date is valid
 */
export function isValid(dateValue: string | Date | null | undefined): boolean {
  if (!dateValue) return false;
  const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
  return date instanceof Date && !isNaN(date.getTime());
}
 * @param dateValue - Date string, Date object, or potentially invalid value
 * @returns boolean indicating if the date is valid
 */
export function isValidDate(dateValue: string | Date | null | undefined): boolean {
  if (!dateValue) return false

  try {
    let date: Date

    if (typeof dateValue === 'string') {
      date = dateValue.includes('T') ? parseISO(dateValue) : new Date(dateValue)
    } else if (dateValue instanceof Date) {
      date = dateValue
    } else {
      return false
    }

    return isValid(date)
  } catch {
    return false
  }
}

/**
 * Format date for display in cards/lists
 * @param dateValue - Date to format
 * @returns Short formatted date
 */
export function formatCardDate(dateValue: string | Date | null | undefined): string {
  return safeFormatDate(dateValue, 'MMM d, yyyy', 'No date')
}

/**
 * Format datetime for detailed views
 * @param dateValue - Date to format  
 * @returns Full formatted datetime
 */
export function formatDetailDate(dateValue: string | Date | null | undefined): string {
  return safeFormatDate(dateValue, 'PPpp', 'Date not recorded')
}

/**
 * Format time only
 * @param dateValue - Date to format
 * @returns Time portion only
 */
export function formatTime(dateValue: string | Date | null | undefined): string {
  return safeFormatDate(dateValue, 'p', 'Time not recorded')
}