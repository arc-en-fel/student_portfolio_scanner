import { useState, useCallback, useRef, useEffect } from 'react'

interface FormState {
  [key: string]: unknown
}

interface FieldError {
  [key: string]: string | null
}

interface UseFormWithAutosaveReturn<T extends FormState> {
  formState: T
  updateField: (key: keyof T, value: unknown) => void
  clearError: (key: keyof T) => void
  saveCurrent: () => Promise<void>
  isAutoSaving: boolean
  isDirty: boolean
  errors: FieldError
}

/**
 * Hook for form state management with autosave debouncing
 * @param initialData - Initial form data
 * @param onSave - Callback function to save form data
 * @param debounceMs - Debounce delay in milliseconds (default: 500)
 * @param storageKey - Session storage key for persistence (optional)
 * @returns Form state, handlers, and save function
 */
export function useFormWithAutosave<T extends FormState>(
  initialData: T,
  onSave: (data: T) => Promise<void>,
  debounceMs: number = 500,
  storageKey?: string
): UseFormWithAutosaveReturn<T> {
  // Load from storage if available
  const getInitialState = useCallback((): T => {
    if (storageKey) {
      try {
        const stored = sessionStorage.getItem(storageKey)
        if (stored) {
          return JSON.parse(stored) as T
        }
      } catch (e) {
        console.warn('Failed to restore from session storage:', e)
      }
    }
    return initialData
  }, [initialData, storageKey])

  const [formState, setFormState] = useState<T>(getInitialState())
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [errors, setErrors] = useState<FieldError>({})
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Persist to session storage when form state changes
  useEffect(() => {
    if (storageKey) {
      try {
        sessionStorage.setItem(storageKey, JSON.stringify(formState))
      } catch (e) {
        console.warn('Failed to persist to session storage:', e)
      }
    }
  }, [formState, storageKey])

  // Auto-save with debounce
  useEffect(() => {
    if (!isDirty) return

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(async () => {
      try {
        setIsAutoSaving(true)
        await onSave(formState)
        setIsDirty(false)
        setIsAutoSaving(false)
      } catch (error) {
        console.error('Autosave failed:', error)
        setIsAutoSaving(false)
        // Optionally set an error, but don't prevent further edits
      }
    }, debounceMs)

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [isDirty, formState, debounceMs, onSave])

  const updateField = useCallback((key: keyof T, value: unknown) => {
    setFormState((prev) => ({
      ...prev,
      [key]: value,
    }))
    setIsDirty(true)
    // Clear error for this field when user starts editing
    clearError(key)
  }, [])

  const clearError = useCallback((key: keyof T) => {
    setErrors((prev) => ({
      ...prev,
      [key]: null,
    }))
  }, [])

  const saveCurrent = useCallback(async () => {
    try {
      setIsAutoSaving(true)
      await onSave(formState)
      setIsDirty(false)
      setIsAutoSaving(false)
    } catch (error) {
      console.error('Save failed:', error)
      setIsAutoSaving(false)
      throw error
    }
  }, [formState, onSave])

  return {
    formState,
    updateField,
    clearError,
    saveCurrent,
    isAutoSaving,
    isDirty,
    errors,
  }
}
