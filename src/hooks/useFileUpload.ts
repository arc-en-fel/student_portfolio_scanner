import { useState, useCallback } from 'react'
import { uploadFile } from '@/lib/file-storage'
import type { BucketKey } from '@/lib/file-storage'

interface UseFileUploadState {
  loading: boolean
  error: Error | null
  progress: number
}

interface UseFileUploadReturn extends UseFileUploadState {
  upload: (file: File, userId: string) => Promise<string>
  reset: () => void
}

/**
 * Hook for uploading files to Supabase storage
 * @param bucketKey - Bucket to upload to (avatars, projects, certificates, resumes)
 * @returns Object with upload function and state
 */
export function useFileUpload(bucketKey: BucketKey): UseFileUploadReturn {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [progress, setProgress] = useState(0)

  const upload = useCallback(
    async (file: File, userId: string): Promise<string> => {
      setLoading(true)
      setError(null)
      setProgress(0)

      try {
        // Reset progress
        setProgress(10)

        // Validate file
        if (!file) {
          throw new Error('File is required')
        }

        if (!userId) {
          throw new Error('User ID is required')
        }

        setProgress(25)

        // Upload file
        const filePath = await uploadFile(file, bucketKey, userId)

        setProgress(100)
        setLoading(false)
        return filePath
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error')
        setError(error)
        setLoading(false)
        throw error
      }
    },
    [bucketKey]
  )

  const reset = useCallback(() => {
    setLoading(false)
    setError(null)
    setProgress(0)
  }, [])

  return {
    upload,
    loading,
    error,
    progress,
    reset,
  }
}
