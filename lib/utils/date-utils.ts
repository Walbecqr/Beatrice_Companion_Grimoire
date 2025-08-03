// lib/utils/date-utils.ts - Safe date formatting utilities

import { format, isValid, parseISO } from 'date-fns'

/**
 * Safely formats a date value with fallback handling
 * @param dateValue - Date string, Date object, or potentially invalid value
 * @param formatStr - date-fns format string (default: 'PPp')
 * @param fallback - Fallback text when date is invalid
 * @returns Formatted date string or fallback
 */
export function safeFormatDate(
  dateValue: string | Date | null | undefined,
  formatStr: string = 'PPp',
  fallback: string = 'Date not available'
): string {
  if (!dateValue) {
    return fallback;
  }
  try {
    let date: Date;
    if (typeof dateValue === 'string') {
      // Handle invalid date strings
      if (!dateValue.match(/^\d{4}-\d{2}-\d{2}/) && !Date.parse(dateValue)) {
        return fallback;
      }
      date = dateValue.includes('T') ? parseISO(dateValue) : new Date(dateValue);
    } else if (dateValue instanceof Date) {
      date = dateValue;
    } else {
      return fallback;
    }
    if (!isValid(date)) {
      console.warn('Invalid date value:', dateValue);
      return fallback;
    }
    return format(date, formatStr);
  } catch (error) {
    console.error('Date formatting error:', error, 'Value:', dateValue);
    return fallback;
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
 * Checks if a date value is valid
 * @param dateValue - Date string, Date object, or potentially invalid value
 * @returns boolean indicating if the date is valid
 */
export function isValidDateValue(
  dateValue: string | Date | null | undefined
): boolean {
  if (!dateValue) return false;

  try {
    let date: Date;
    if (typeof dateValue === 'string') {
      date = dateValue.includes('T') ? parseISO(dateValue) : new Date(dateValue);
    } else if (dateValue instanceof Date) {
      date = dateValue;
    } else {
      return false;
    }
    return isValid(date);
  } catch {
    return false;
  }
}
/**
 * Get start of day for a date value
 * @param dateValue - Date string or Date object
 * @returns Date object set to start of day or null if invalid
 */
export function getStartOfDay(dateValue: string | Date): Date | null {
  try {
    const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
    if (!isValid(date)) return null;
    return new Date(date.setHours(0, 0, 0, 0));
  } catch {
    return null;
  }
}
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