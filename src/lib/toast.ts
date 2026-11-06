import { toast as sonnerToast } from 'sonner'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastOptions {
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
  dismissible?: boolean
  description?: string
}

/**
 * Show a toast notification using Sonner
 * @param type - Type of toast (success, error, warning, info)
 * @param message - Toast message
 * @param options - Additional options
 */
export function showToast(type: ToastType, message: string, options?: ToastOptions): void {
  const defaultDuration = options?.duration || 3000

  switch (type) {
    case 'success':
      sonnerToast.success(message, {
        duration: defaultDuration,
        action: options?.action,
        description: options?.description,
      })
      break

    case 'error':
      sonnerToast.error(message, {
        duration: defaultDuration,
        action: options?.action,
        description: options?.description,
      })
      break

    case 'warning':
      sonnerToast.warning(message, {
        duration: defaultDuration,
        action: options?.action,
        description: options?.description,
      })
      break

    case 'info':
      sonnerToast(message, {
        duration: defaultDuration,
        action: options?.action,
        description: options?.description,
      })
      break

    default:
      sonnerToast(message, {
        duration: defaultDuration,
      })
  }
}

/**
 * Show success toast
 */
export function showSuccessToast(message: string, options?: ToastOptions): void {
  showToast('success', message, options)
}

/**
 * Show error toast
 */
export function showErrorToast(message: string, options?: ToastOptions): void {
  showToast('error', message, options)
}

/**
 * Show warning toast
 */
export function showWarningToast(message: string, options?: ToastOptions): void {
  showToast('warning', message, options)
}

/**
 * Show info toast
 */
export function showInfoToast(message: string, options?: ToastOptions): void {
  showToast('info', message, options)
}

/**
 * Show loading toast that can be updated
 */
export function showLoadingToast(message: string): ReturnType<typeof sonnerToast.loading> {
  return sonnerToast.loading(message)
}

/**
 * Dismiss toast by ID
 */
export function dismissToast(toastId: string | number): void {
  sonnerToast.dismiss(toastId)
}

/**
 * Dismiss all toasts
 */
export function dismissAllToasts(): void {
  sonnerToast.dismiss()
}
