import { supabase } from './supabase'

export type BucketKey = 'avatars' | 'projects' | 'certificates' | 'resumes'

interface BucketConfig {
  maxSize: number // in bytes
  allowedMimes: string[]
}

export const UPLOAD_CONFIG: Record<BucketKey, BucketConfig> = {
  avatars: {
    maxSize: 2 * 1024 * 1024, // 2MB
    allowedMimes: ['image/jpeg', 'image/png', 'image/webp'],
  },
  projects: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedMimes: ['image/jpeg', 'image/png', 'image/webp'],
  },
  certificates: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedMimes: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
  },
  resumes: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedMimes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  },
}

/**
 * Sanitize filename by removing invalid characters and path traversal attempts
 */
export function sanitizeFileName(name: string): string {
  return name
    .replace(/\.\./g, '') // Remove path traversal
    .replace(/[\/\\:*?"<>|]/g, '-') // Replace invalid characters
    .replace(/\s+/g, '-') // Replace spaces with dashes
    .toLowerCase()
    .substring(0, 200) // Limit length
}

/**
 * Get MIME type from file extension
 */
export function getMimeType(fileName: string): string | null {
  const ext = fileName.split('.').pop()?.toLowerCase()
  const mimeMap: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  }
  return ext ? mimeMap[ext] || null : null
}

/**
 * Upload file to Supabase storage
 * @param file - File to upload
 * @param bucket - Bucket key (avatars, projects, certificates, resumes)
 * @param userId - User ID for path construction
 * @returns Path in storage on success
 * @throws Error if validation fails or upload fails
 */
export async function uploadFile(file: File, bucket: BucketKey, userId: string): Promise<string> {
  // Validate bucket key
  if (!UPLOAD_CONFIG[bucket]) {
    throw new Error(`Invalid bucket: ${bucket}`)
  }

  const config = UPLOAD_CONFIG[bucket]

  // Validate file size
  if (file.size > config.maxSize) {
    throw new Error(`File exceeds ${config.maxSize / (1024 * 1024)} MB limit`)
  }

  // Validate MIME type
  if (!config.allowedMimes.includes(file.type)) {
    throw new Error(`File type ${file.type} not allowed. Allowed types: ${config.allowedMimes.join(', ')}`)
  }

  // Construct path: [bucket]/[userId]/[filename]
  const sanitized = sanitizeFileName(file.name)
  const timestamp = Date.now()
  const fileName = `${timestamp}-${sanitized}`
  const filePath = `${userId}/${fileName}`

  // Upload to Supabase storage
  const { error } = await supabase.storage.from(bucket).upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
  })

  if (error) {
    throw new Error(`Upload failed: ${error.message}`)
  }

  return filePath
}

/**
 * Get signed URL for private file (expires in 1 hour)
 * @param filePath - Path to file in storage
 * @param bucket - Bucket name
 * @param expirySeconds - Expiry time in seconds (default: 3600 = 1 hour)
 * @returns Signed URL
 * @throws Error if URL generation fails
 */
export async function getSignedUrl(filePath: string, bucket: BucketKey, expirySeconds: number = 3600): Promise<string> {
  if (!UPLOAD_CONFIG[bucket]) {
    throw new Error(`Invalid bucket: ${bucket}`)
  }

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(filePath, expirySeconds)

  if (error) {
    throw new Error(`Failed to generate signed URL: ${error.message}`)
  }

  if (!data?.signedUrl) {
    throw new Error('No signed URL returned')
  }

  return data.signedUrl
}

/**
 * Get public URL for file in public bucket
 * @param filePath - Path to file in storage
 * @param bucket - Bucket name
 * @returns Public URL
 */
export function getPublicUrl(filePath: string, bucket: BucketKey): string {
  if (!UPLOAD_CONFIG[bucket]) {
    throw new Error(`Invalid bucket: ${bucket}`)
  }

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath)

  return data?.publicUrl || ''
}

/**
 * Delete file from storage
 * @param filePath - Path to file in storage
 * @param bucket - Bucket name
 * @throws Error if deletion fails
 */
export async function deleteFile(filePath: string, bucket: BucketKey): Promise<void> {
  if (!UPLOAD_CONFIG[bucket]) {
    throw new Error(`Invalid bucket: ${bucket}`)
  }

  const { error } = await supabase.storage
    .from(bucket)
    .remove([filePath])

  if (error) {
    throw new Error(`Failed to delete file: ${error.message}`)
  }
}

/**
 * Check if file is an image
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/')
}

/**
 * Check if file is a PDF
 */
export function isPDFFile(file: File): boolean {
  return file.type === 'application/pdf'
}

/**
 * Get file extension from filename
 */
export function getFileExtension(fileName: string): string {
  const parts = fileName.split('.')
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ''
}
