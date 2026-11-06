import { describe, it, expect } from 'vitest'
import {
  isValidYear,
  isValidDateRange,
  formatDate,
  calculateAge,
  getDaysBetween,
  parseToISODate,
  getFormattedDuration,
} from './date-utils'

describe('Date Utilities', () => {
  describe('isValidYear', () => {
    it('should accept valid years', () => {
      expect(isValidYear(1900)).toBe(true)
      expect(isValidYear(2000)).toBe(true)
      expect(isValidYear(2100)).toBe(true)
    })

    it('should reject years before 1900', () => {
      expect(isValidYear(1899)).toBe(false)
    })

    it('should reject years after 2100', () => {
      expect(isValidYear(2101)).toBe(false)
    })

    it('should handle string input', () => {
      expect(isValidYear('2000')).toBe(true)
      expect(isValidYear('1800')).toBe(false)
    })

    it('should reject non-numeric strings', () => {
      expect(isValidYear('abc')).toBe(false)
    })
  })

  describe('isValidDateRange', () => {
    it('should accept valid date ranges', () => {
      expect(isValidDateRange('2020-01-01', '2023-12-31')).toBe(true)
    })

    it('should accept equal dates', () => {
      expect(isValidDateRange('2020-01-01', '2020-01-01')).toBe(true)
    })

    it('should reject end date before start date', () => {
      expect(isValidDateRange('2023-12-31', '2020-01-01')).toBe(false)
    })

    it('should handle null/undefined dates', () => {
      expect(isValidDateRange(null, '2020-01-01')).toBe(true)
      expect(isValidDateRange('2020-01-01', undefined)).toBe(true)
      expect(isValidDateRange(null, undefined)).toBe(true)
    })

    it('should work with Date objects', () => {
      const start = new Date('2020-01-01')
      const end = new Date('2023-12-31')
      expect(isValidDateRange(start, end)).toBe(true)
    })

    it('should reject invalid dates', () => {
      expect(isValidDateRange('invalid', '2020-01-01')).toBe(false)
    })
  })

  describe('formatDate', () => {
    it('should format date in long format', () => {
      const result = formatDate('2020-01-15', 'long')
      expect(result).toMatch(/January 15, 2020/)
    })

    it('should format date in short format', () => {
      const result = formatDate('2020-01-15', 'short')
      expect(result).toMatch(/Jan/)
    })

    it('should format date in numeric format', () => {
      const result = formatDate('2020-01-15', 'numeric')
      expect(result).toMatch(/01\/15\/2020|01-15-2020/)
    })

    it('should use long format by default', () => {
      const result = formatDate('2020-01-15')
      expect(result).toMatch(/January 15, 2020/)
    })

    it('should work with Date objects', () => {
      const date = new Date('2020-01-15')
      const result = formatDate(date, 'long')
      expect(result).toMatch(/January 15, 2020/)
    })

    it('should return empty for invalid date', () => {
      const result = formatDate('invalid', 'long')
      expect(result).toBe('')
    })
  })

  describe('calculateAge', () => {
    it('should calculate age correctly', () => {
      const dob = new Date()
      dob.setFullYear(dob.getFullYear() - 25)
      const age = calculateAge(dob)
      expect(age).toBe(25)
    })

    it('should return null for null input', () => {
      expect(calculateAge(null)).toBeNull()
    })

    it('should return null for invalid date', () => {
      expect(calculateAge('invalid')).toBeNull()
    })

    it('should handle string dates', () => {
      const age = calculateAge('1998-05-15')
      expect(typeof age).toBe('number')
      expect(age).toBeGreaterThan(0)
    })

    it('should return null for future date of birth', () => {
      const futureDate = new Date()
      futureDate.setFullYear(futureDate.getFullYear() + 10)
      expect(calculateAge(futureDate)).toBeNull()
    })
  })

  describe('getDaysBetween', () => {
    it('should calculate days between dates', () => {
      const days = getDaysBetween('2020-01-01', '2020-01-11')
      expect(days).toBe(10)
    })

    it('should return 0 for same date', () => {
      const days = getDaysBetween('2020-01-01', '2020-01-01')
      expect(days).toBe(0)
    })

    it('should handle reversed dates', () => {
      const days = getDaysBetween('2020-01-11', '2020-01-01')
      expect(days).toBe(10)
    })

    it('should work with Date objects', () => {
      const date1 = new Date('2020-01-01')
      const date2 = new Date('2020-01-11')
      expect(getDaysBetween(date1, date2)).toBe(10)
    })

    it('should return 0 for invalid dates', () => {
      expect(getDaysBetween('invalid', '2020-01-01')).toBe(0)
    })
  })

  describe('parseToISODate', () => {
    it('should convert to ISO format', () => {
      const result = parseToISODate('2020-01-15')
      expect(result).toBe('2020-01-15')
    })

    it('should handle various date formats', () => {
      const result = parseToISODate('01/15/2020')
      expect(result).toMatch(/2020-01-\d{2}/)
    })

    it('should return empty for invalid date', () => {
      expect(parseToISODate('invalid')).toBe('')
    })

    it('should return empty for empty string', () => {
      expect(parseToISODate('')).toBe('')
    })
  })

  describe('getFormattedDuration', () => {
    it('should format duration in years and months', () => {
      const result = getFormattedDuration('2020-01-01', '2023-04-15')
      expect(result).toMatch(/3 years? 3 months?/)
    })

    it('should format years only', () => {
      const result = getFormattedDuration('2020-01-01', '2025-01-01')
      expect(result).toMatch(/5 years?/)
    })

    it('should format months only', () => {
      const result = getFormattedDuration('2020-01-01', '2020-07-01')
      expect(result).toMatch(/6 months?/)
    })

    it('should use today if endDate not provided', () => {
      const result = getFormattedDuration('2020-01-01')
      expect(result).not.toBe('')
    })

    it('should handle edge cases', () => {
      const result = getFormattedDuration('2020-01-01', '2020-01-15')
      expect(result).toBe('Less than a month')
    })
  })
})
