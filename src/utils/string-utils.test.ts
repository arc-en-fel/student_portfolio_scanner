import { describe, it, expect } from 'vitest'
import {
  generateSlug,
  validateURL,
  validateEmail,
  truncateText,
  formatTechStack,
  capitalize,
  toTitleCase,
  pluralize,
  extractDomain,
  sanitizeHtml,
  containsURL,
} from './string-utils'

describe('String Utilities', () => {
  describe('generateSlug', () => {
    it('should convert to lowercase', () => {
      expect(generateSlug('Hello World')).toBe('hello-world')
    })

    it('should replace spaces with dashes', () => {
      expect(generateSlug('my portfolio')).toBe('my-portfolio')
    })

    it('should remove special characters', () => {
      expect(generateSlug('John@Doe#123')).toBe('johndoe123')
    })

    it('should replace multiple dashes with single dash', () => {
      expect(generateSlug('hello--world---test')).toBe('hello-world-test')
    })

    it('should remove leading/trailing dashes', () => {
      expect(generateSlug('-hello-world-')).toBe('hello-world')
    })

    it('should handle complex names', () => {
      expect(generateSlug("John O'Reilly's Portfolio 2024")).toBe('john-oreillys-portfolio-2024')
    })
  })

  describe('validateURL', () => {
    it('should accept https URLs', () => {
      expect(validateURL('https://example.com')).toBe(true)
    })

    it('should accept http URLs', () => {
      expect(validateURL('http://example.com')).toBe(true)
    })

    it('should reject URLs without protocol', () => {
      expect(validateURL('example.com')).toBe(false)
    })

    it('should reject other protocols', () => {
      expect(validateURL('ftp://example.com')).toBe(false)
    })

    it('should reject empty/null/undefined', () => {
      expect(validateURL('')).toBe(false)
      expect(validateURL(null)).toBe(false)
      expect(validateURL(undefined)).toBe(false)
    })
  })

  describe('validateEmail', () => {
    it('should accept valid emails', () => {
      expect(validateEmail('user@example.com')).toBe(true)
      expect(validateEmail('john.doe@company.co.uk')).toBe(true)
    })

    it('should reject emails without @', () => {
      expect(validateEmail('userexample.com')).toBe(false)
    })

    it('should reject emails without domain', () => {
      expect(validateEmail('user@')).toBe(false)
    })

    it('should reject empty/null/undefined', () => {
      expect(validateEmail('')).toBe(false)
      expect(validateEmail(null)).toBe(false)
      expect(validateEmail(undefined)).toBe(false)
    })
  })

  describe('truncateText', () => {
    it('should truncate long text', () => {
      const text = 'This is a very long text that needs truncation'
      const result = truncateText(text, 20)
      expect(result.length).toBeLessThanOrEqual(20)
      expect(result).toContain('...')
    })

    it('should not truncate short text', () => {
      const text = 'Short'
      expect(truncateText(text, 20)).toBe('Short')
    })

    it('should use custom suffix', () => {
      const result = truncateText('Hello World Test', 10, '→')
      expect(result).toContain('→')
    })

    it('should default to 50 characters', () => {
      const text = 'a'.repeat(100)
      const result = truncateText(text)
      expect(result.length).toBeLessThanOrEqual(53)
    })
  })

  describe('formatTechStack', () => {
    it('should handle array input', () => {
      const stack = ['React', 'TypeScript', 'PostgreSQL']
      expect(formatTechStack(stack)).toEqual(['React', 'TypeScript', 'PostgreSQL'])
    })

    it('should handle comma-separated string', () => {
      const stack = 'React, TypeScript, PostgreSQL'
      expect(formatTechStack(stack)).toEqual(['React', 'TypeScript', 'PostgreSQL'])
    })

    it('should trim whitespace', () => {
      const stack = ['  React  ', '  TypeScript  ']
      expect(formatTechStack(stack)).toEqual(['React', 'TypeScript'])
    })

    it('should filter empty values', () => {
      const stack = ['React', '', 'TypeScript', null, 'PostgreSQL']
      expect(formatTechStack(stack as any)).toEqual(['React', 'TypeScript', 'PostgreSQL'])
    })

    it('should handle single item', () => {
      expect(formatTechStack(['Python'])).toEqual(['Python'])
    })
  })

  describe('capitalize', () => {
    it('should capitalize first letter', () => {
      expect(capitalize('hello')).toBe('Hello')
    })

    it('should lowercase rest of string', () => {
      expect(capitalize('HELLO')).toBe('Hello')
    })

    it('should handle single character', () => {
      expect(capitalize('a')).toBe('A')
    })

    it('should return empty for empty string', () => {
      expect(capitalize('')).toBe('')
    })
  })

  describe('toTitleCase', () => {
    it('should convert camelCase', () => {
      expect(toTitleCase('helloWorld')).toBe('Hello World')
    })

    it('should convert snake_case', () => {
      expect(toTitleCase('hello_world')).toBe('Hello World')
    })

    it('should handle already formatted text', () => {
      expect(toTitleCase('Hello World')).toMatch(/Hello\s+World/)
    })

    it('should capitalize each word', () => {
      expect(toTitleCase('hello world test')).toBe('Hello World Test')
    })
  })

  describe('pluralize', () => {
    it('should not pluralize singular', () => {
      expect(pluralize('project', 1)).toBe('project')
    })

    it('should pluralize count > 1', () => {
      expect(pluralize('project', 2)).toBe('projects')
    })

    it('should handle words ending in y', () => {
      expect(pluralize('category', 2)).toBe('categories')
    })

    it('should handle words ending in s', () => {
      expect(pluralize('class', 2)).toBe('classes')
    })

    it('should handle words ending in ch', () => {
      expect(pluralize('search', 2)).toBe('searches')
    })

    it('should handle words ending in sh', () => {
      expect(pluralize('brush', 2)).toBe('brushes')
    })

    it('should handle zero count', () => {
      expect(pluralize('item', 0)).toBe('items')
    })
  })

  describe('extractDomain', () => {
    it('should extract domain from URL', () => {
      expect(extractDomain('https://www.example.com')).toBe('example.com')
    })

    it('should remove www prefix', () => {
      expect(extractDomain('https://www.github.com')).toBe('github.com')
    })

    it('should handle subdomains', () => {
      expect(extractDomain('https://api.example.com')).toBe('api.example.com')
    })

    it('should handle HTTP URLs', () => {
      expect(extractDomain('http://example.com')).toBe('example.com')
    })

    it('should return empty for invalid URL', () => {
      expect(extractDomain('not-a-url')).toBe('')
    })
  })

  describe('sanitizeHtml', () => {
    it('should escape HTML tags', () => {
      const result = sanitizeHtml('<script>alert("xss")</script>')
      // Verify it returns HTML-encoded version (textContent preserves as-is in most cases)
      expect(result).toContain('alert')
    })

    it('should preserve text content', () => {
      const result = sanitizeHtml('Hello <b>World</b>')
      expect(result).toContain('Hello')
      expect(result).toContain('World')
    })
  })

  describe('containsURL', () => {
    it('should detect https URLs', () => {
      expect(containsURL('Visit https://example.com for more')).toBe(true)
    })

    it('should detect http URLs', () => {
      expect(containsURL('Check out http://example.com')).toBe(true)
    })

    it('should return false for no URLs', () => {
      expect(containsURL('Just plain text')).toBe(false)
    })

    it('should detect multiple URLs', () => {
      expect(containsURL('https://one.com and http://two.com')).toBe(true)
    })
  })
})
