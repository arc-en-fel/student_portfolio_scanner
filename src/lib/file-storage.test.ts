import { describe, it, expect } from 'vitest'
import {
  sanitizeFileName,
  getMimeType,
  getFileExtension,
  isImageFile,
  isPDFFile,
  UPLOAD_CONFIG,
} from './file-storage'

describe('File Storage Utilities', () => {
  describe('sanitizeFileName', () => {
    it('should remove path traversal', () => {
      const result = sanitizeFileName('../../../etc/passwd.txt')
      expect(result).not.toContain('..')
    })

    it('should replace spaces with dashes', () => {
      const result = sanitizeFileName('my file name.txt')
      expect(result).toContain('-')
    })

    it('should convert to lowercase', () => {
      const result = sanitizeFileName('MyFileName.TXT')
      expect(result).toBe(result.toLowerCase())
    })

    it('should limit length to 200', () => {
      const longName = 'a'.repeat(300) + '.txt'
      const result = sanitizeFileName(longName)
      expect(result.length).toBeLessThanOrEqual(200)
    })
  })

  describe('getMimeType', () => {
    it('should return correct MIME for images', () => {
      expect(getMimeType('photo.jpg')).toBe('image/jpeg')
      expect(getMimeType('image.png')).toBe('image/png')
      expect(getMimeType('graphic.webp')).toBe('image/webp')
    })

    it('should return correct MIME for documents', () => {
      expect(getMimeType('document.pdf')).toBe('application/pdf')
    })

    it('should be case insensitive', () => {
      expect(getMimeType('Photo.JPG')).toBe('image/jpeg')
    })

    it('should return null for unknown type', () => {
      expect(getMimeType('unknown.xyz')).toBeNull()
    })
  })

  describe('getFileExtension', () => {
    it('should extract extension', () => {
      expect(getFileExtension('photo.jpg')).toBe('jpg')
      expect(getFileExtension('document.pdf')).toBe('pdf')
    })

    it('should return lowercase', () => {
      expect(getFileExtension('Photo.JPG')).toBe('jpg')
    })

    it('should return empty for files without extension', () => {
      expect(getFileExtension('noextension')).toBe('')
    })
  })

  describe('isImageFile', () => {
    it('should identify image files by File type', () => {
      const imageFile = new File([''], 'photo.jpg', { type: 'image/jpeg' })
      expect(isImageFile(imageFile)).toBe(true)
    })

    it('should reject non-image files', () => {
      const pdfFile = new File([''], 'document.pdf', { type: 'application/pdf' })
      expect(isImageFile(pdfFile)).toBe(false)
    })
  })

  describe('isPDFFile', () => {
    it('should identify PDF files by File type', () => {
      const pdfFile = new File([''], 'document.pdf', { type: 'application/pdf' })
      expect(isPDFFile(pdfFile)).toBe(true)
    })

    it('should reject non-PDF files', () => {
      const imageFile = new File([''], 'photo.jpg', { type: 'image/jpeg' })
      expect(isPDFFile(imageFile)).toBe(false)
    })
  })

  describe('UPLOAD_CONFIG', () => {
    it('should have avatars bucket config with 2MB limit', () => {
      expect(UPLOAD_CONFIG.avatars).toBeDefined()
      expect(UPLOAD_CONFIG.avatars.maxSize).toBe(2 * 1024 * 1024)
      expect(UPLOAD_CONFIG.avatars.allowedMimes).toContain('image/jpeg')
    })

    it('should have projects bucket config with 5MB limit', () => {
      expect(UPLOAD_CONFIG.projects).toBeDefined()
      expect(UPLOAD_CONFIG.projects.maxSize).toBe(5 * 1024 * 1024)
    })

    it('should have certificates bucket config with 10MB limit', () => {
      expect(UPLOAD_CONFIG.certificates).toBeDefined()
      expect(UPLOAD_CONFIG.certificates.maxSize).toBe(10 * 1024 * 1024)
      expect(UPLOAD_CONFIG.certificates.allowedMimes).toContain('application/pdf')
    })

    it('should have resumes bucket config with 10MB limit', () => {
      expect(UPLOAD_CONFIG.resumes).toBeDefined()
      expect(UPLOAD_CONFIG.resumes.maxSize).toBe(10 * 1024 * 1024)
    })

    it('should verify file exceeds 2MB avatar limit', () => {
      const file = new File(['x'.repeat(3 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' })
      expect(file.size).toBeGreaterThan(UPLOAD_CONFIG.avatars.maxSize)
    })
  })
})
