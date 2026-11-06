/**
 * Validate if a year is within acceptable range (1900-2100)
 * @param year - Year to validate
 * @returns True if year is valid
 */
export function isValidYear(year: number | string): boolean {
  const yearNum = typeof year === 'string' ? parseInt(year, 10) : year

  if (isNaN(yearNum)) {
    return false
  }

  return yearNum >= 1900 && yearNum <= 2100
}

/**
 * Validate if date range is valid (end date >= start date)
 * @param startDate - Start date (YYYY-MM-DD format or Date object)
 * @param endDate - End date (YYYY-MM-DD format or Date object)
 * @returns True if range is valid
 */
export function isValidDateRange(
  startDate: string | Date | null | undefined,
  endDate: string | Date | null | undefined
): boolean {
  if (!startDate || !endDate) {
    return true // Both dates not provided is valid
  }

  const start = new Date(startDate)
  const end = new Date(endDate)

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return false
  }

  return end >= start
}

/**
 * Format date to locale string
 * @param date - Date to format
 * @param format - Format type ('long', 'short', 'numeric') or custom format
 * @returns Formatted date string
 */
export function formatDate(date: string | Date, format: 'long' | 'short' | 'numeric' = 'long'): string {
  const dateObj = new Date(date)

  if (isNaN(dateObj.getTime())) {
    return ''
  }

  const options: Intl.DateTimeFormatOptions = {
    long: { year: 'numeric' as const, month: 'long' as const, day: 'numeric' as const },
    short: { year: '2-digit' as const, month: 'short' as const, day: 'numeric' as const },
    numeric: { year: 'numeric' as const, month: '2-digit' as const, day: '2-digit' as const },
  }[format] || { year: 'numeric' as const, month: 'long' as const, day: 'numeric' as const }

  return new Intl.DateTimeFormat('en-US', options).format(dateObj)
}

/**
 * Calculate age from date of birth
 * @param dateOfBirth - Date of birth (YYYY-MM-DD format or Date object)
 * @returns Age in years
 */
export function calculateAge(dateOfBirth: string | Date | null): number | null {
  if (!dateOfBirth) {
    return null
  }

  const dob = new Date(dateOfBirth)

  if (isNaN(dob.getTime())) {
    return null
  }

  const today = new Date()
  let age = today.getFullYear() - dob.getFullYear()
  const monthDiff = today.getMonth() - dob.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--
  }

  return age < 0 ? null : age
}

/**
 * Get difference in days between two dates
 * @param date1 - First date
 * @param date2 - Second date
 * @returns Number of days between dates
 */
export function getDaysBetween(date1: string | Date, date2: string | Date): number {
  const d1 = new Date(date1)
  const d2 = new Date(date2)

  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
    return 0
  }

  const diffTime = Math.abs(d2.getTime() - d1.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Parse date string to ISO format (YYYY-MM-DD)
 * @param dateString - Date string to parse
 * @returns ISO formatted date or empty string if invalid
 */
export function parseToISODate(dateString: string): string {
  if (!dateString) {
    return ''
  }

  const date = new Date(dateString)

  if (isNaN(date.getTime())) {
    return ''
  }

  return date.toISOString().split('T')[0]
}

/**
 * Get formatted duration between two dates (e.g., "2 years 3 months")
 * @param startDate - Start date
 * @param endDate - End date (optional, uses today if not provided)
 * @returns Duration string
 */
export function getFormattedDuration(startDate: string | Date, endDate?: string | Date): string {
  const start = new Date(startDate)
  const end = endDate ? new Date(endDate) : new Date()

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return ''
  }

  let months = (end.getFullYear() - start.getFullYear()) * 12
  months += end.getMonth() - start.getMonth()

  const years = Math.floor(months / 12)
  const remainingMonths = months % 12

  const parts: string[] = []
  if (years > 0) {
    parts.push(`${years} year${years > 1 ? 's' : ''}`)
  }
  if (remainingMonths > 0) {
    parts.push(`${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`)
  }

  return parts.join(' ') || 'Less than a month'
}
