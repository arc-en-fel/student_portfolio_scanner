/**
 * Generate URL-safe slug from text
 * @param text - Text to convert to slug
 * @returns URL-safe slug
 */
export function generateSlug(text: string): string {
  if (!text) {
    return ''
  }

  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with dashes
    .replace(/-+/g, '-') // Replace multiple dashes with single dash
    .replace(/^-|-$/g, '') // Remove leading/trailing dashes
}

/**
 * Validate URL format (must start with http:// or https://)
 * @param url - URL to validate
 * @returns True if URL is valid
 */
export function validateURL(url: string | undefined | null): boolean {
  if (!url) {
    return false
  }

  try {
    const urlObj = new URL(url)
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Validate email format
 * @param email - Email to validate
 * @returns True if email is valid
 */
export function validateEmail(email: string | undefined | null): boolean {
  if (!email) {
    return false
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Truncate text with ellipsis
 * @param text - Text to truncate
 * @param length - Maximum length (including ellipsis)
 * @param suffix - Suffix to add (default: '...')
 * @returns Truncated text
 */
export function truncateText(text: string, length: number = 50, suffix: string = '...'): string {
  if (!text || text.length <= length) {
    return text
  }

  return text.slice(0, length - suffix.length) + suffix
}

/**
 * Format technology stack array or comma-separated string
 * @param stack - Array of technologies or comma-separated string
 * @returns Formatted array of technologies
 */
export function formatTechStack(stack: string[] | string): string[] {
  if (Array.isArray(stack)) {
    return stack.filter((item) => item && typeof item === 'string').map((item) => item.trim())
  }

  if (typeof stack === 'string') {
    return stack
      .split(',')
      .filter((item) => item && typeof item === 'string')
      .map((item) => item.trim())
  }

  return []
}

/**
 * Capitalize first letter of string
 * @param text - Text to capitalize
 * @returns Capitalized text
 */
export function capitalize(text: string): string {
  if (!text) {
    return ''
  }

  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

/**
 * Convert camelCase or snake_case to Title Case
 * @param text - Text to convert
 * @returns Title case text
 */
export function toTitleCase(text: string): string {
  if (!text) {
    return ''
  }

  return text
    .replace(/([A-Z])/g, ' $1') // Handle camelCase
    .replace(/_/g, ' ') // Handle snake_case
    .replace(/\b\w/g, (char) => char.toUpperCase()) // Capitalize each word
    .trim()
}

/**
 * Pluralize word based on count
 * @param word - Word to pluralize
 * @param count - Count
 * @returns Pluralized word
 */
export function pluralize(word: string, count: number): string {
  if (count === 1) {
    return word
  }

  if (word.endsWith('y')) {
    return word.slice(0, -1) + 'ies'
  }

  if (word.endsWith('s') || word.endsWith('ss') || word.endsWith('ch') || word.endsWith('sh')) {
    return word + 'es'
  }

  return word + 's'
}

/**
 * Extract domain from URL
 * @param url - URL to extract domain from
 * @returns Domain name
 */
export function extractDomain(url: string): string {
  if (!url) {
    return ''
  }

  try {
    const urlObj = new URL(url)
    return urlObj.hostname.replace('www.', '')
  } catch {
    return ''
  }
}

/**
 * Sanitize HTML string for safe display
 * @param html - HTML string to sanitize
 * @returns Sanitized text
 */
export function sanitizeHtml(html: string): string {
  if (!html) {
    return ''
  }

  const div = document.createElement('div')
  div.textContent = html
  return div.innerHTML
}

/**
 * Check if string contains URL
 * @param text - Text to check
 * @returns True if text contains URL
 */
export function containsURL(text: string): boolean {
  if (!text) {
    return false
  }

  const urlRegex = /https?:\/\/[^\s]+/
  return urlRegex.test(text)
}
