/**
 * Get MIME type from filename
 * @param fileName - Filename to check
 * @returns MIME type or 'application/octet-stream' if unknown
 */
export function getMimeType(fileName: string): string {
  if (!fileName) {
    return 'application/octet-stream'
  }

  const ext = fileName.split('.').pop()?.toLowerCase()

  const mimeMap: Record<string, string> = {
    // Images
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
    svg: 'image/svg+xml',

    // Documents
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    txt: 'text/plain',

    // Archives
    zip: 'application/zip',
    rar: 'application/x-rar-compressed',
    gz: 'application/gzip',

    // Video
    mp4: 'video/mp4',
    webm: 'video/webm',
    mov: 'video/quicktime',

    // Audio
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    m4a: 'audio/mp4',
  }

  return mimeMap[ext || ''] || 'application/octet-stream'
}

/**
 * Sanitize file path by removing path traversal attempts
 * @param path - File path to sanitize
 * @returns Sanitized path
 */
export function sanitizePath(path: string): string {
  if (!path) {
    return ''
  }

  // Remove path traversal attempts
  return path
    .replace(/\.\./g, '')
    .replace(/[\/\\]/g, '-')
    .replace(/:/g, '')
}

/**
 * Get file extension from filename
 * @param fileName - Filename
 * @returns File extension (lowercase, without dot)
 */
export function getFileExtension(fileName: string): string {
  if (!fileName) {
    return ''
  }

  const parts = fileName.split('.')
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ''
}

/**
 * Check if file is an image based on MIME type or extension
 * @param file - File object or filename
 * @returns True if file is image
 */
export function isImageFile(file: File | string): boolean {
  if (file instanceof File) {
    return file.type.startsWith('image/')
  }

  // Check by extension
  const ext = getFileExtension(file)
  return ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(ext)
}

/**
 * Check if file is a PDF
 * @param file - File object or filename
 * @returns True if file is PDF
 */
export function isPDFFile(file: File | string): boolean {
  if (file instanceof File) {
    return file.type === 'application/pdf'
  }

  return getFileExtension(file) === 'pdf'
}

/**
 * Get human-readable file size
 * @param bytes - File size in bytes
 * @returns Human-readable size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) {
    return '0 Bytes'
  }

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Validate file based on MIME type and size
 * @param file - File to validate
 * @param maxSize - Maximum size in bytes
 * @param allowedMimes - Array of allowed MIME types
 * @returns Error message or null if valid
 */
export function validateFile(file: File, maxSize: number, allowedMimes: string[]): string | null {
  if (!file) {
    return 'File is required'
  }

  if (file.size > maxSize) {
    return `File size must be less than ${formatFileSize(maxSize)}`
  }

  if (!allowedMimes.includes(file.type)) {
    return `File type not allowed. Allowed types: ${allowedMimes.join(', ')}`
  }

  return null
}

/**
 * Check if file is a document (PDF, Word, etc.)
 * @param file - File object or filename
 * @returns True if file is document
 */
export function isDocumentFile(file: File | string): boolean {
  const docMimes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ]

  if (file instanceof File) {
    return docMimes.includes(file.type)
  }

  const ext = getFileExtension(file)
  return ['pdf', 'doc', 'docx', 'txt'].includes(ext)
}

/**
 * Get filename from file path
 * @param path - File path
 * @returns Filename only
 */
export function getFileName(path: string): string {
  if (!path) {
    return ''
  }

  return path.split('/').pop() || ''
}

/**
 * Add timestamp to filename
 * @param fileName - Original filename
 * @returns Filename with timestamp
 */
export function addTimestampToFileName(fileName: string): string {
  if (!fileName) {
    return ''
  }

  const ext = getFileExtension(fileName)
  const name = fileName.replace(`.${ext}`, '')
  const timestamp = Date.now()

  return ext ? `${name}-${timestamp}.${ext}` : `${name}-${timestamp}`
}

/**
 * Check if files have same type
 * @param file1 - First file
 * @param file2 - Second file
 * @returns True if same MIME type
 */
export function isSameFileType(file1: File, file2: File): boolean {
  return file1.type === file2.type
}
