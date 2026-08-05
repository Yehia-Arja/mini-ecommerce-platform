import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from 'react'

import { ToastContext, type ToastVariant } from './context'
import { Toast } from './Toast'
import styles from './Toast.module.css'
import { registerToastHandler } from './toast.service'

interface ToastItem {
  id: string
  message: string
  variant: ToastVariant
  dismissing?: boolean
}

const AUTO_DISMISS_MS = 5000
const DISMISS_ANIMATION_MS = 300

interface ToastProviderProps {
  children: ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const baseId = useId()
  const dismissTimeoutRef = useRef<number | null>(null)
  const autoDismissTimeoutRef = useRef<number | null>(null)

  const clearTimers = useCallback(() => {
    if (dismissTimeoutRef.current !== null) {
      window.clearTimeout(dismissTimeoutRef.current)
      dismissTimeoutRef.current = null
    }

    if (autoDismissTimeoutRef.current !== null) {
      window.clearTimeout(autoDismissTimeoutRef.current)
      autoDismissTimeoutRef.current = null
    }
  }, [])

  const dismissToast = useCallback(
    (id: string) => {
      clearTimers()

      setToasts((prev) => prev.map((toast) => (toast.id === id ? { ...toast, dismissing: true } : toast)))

      dismissTimeoutRef.current = window.setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id))
        dismissTimeoutRef.current = null
      }, DISMISS_ANIMATION_MS)
    },
    [clearTimers],
  )

  const addToast = useCallback(
    (message: string, variant: ToastVariant) => {
      clearTimers()

      const id = `${baseId}-${Date.now()}`
      const toast: ToastItem = { id, message, variant }

      setToasts([toast])

      autoDismissTimeoutRef.current = window.setTimeout(() => {
        dismissToast(id)
        autoDismissTimeoutRef.current = null
      }, AUTO_DISMISS_MS)
    },
    [baseId, clearTimers, dismissToast],
  )

  useEffect(() => {
    registerToastHandler(addToast)

    return () => {
      registerToastHandler(null)
      clearTimers()
    }
  }, [addToast, clearTimers])

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div aria-live="polite" aria-relevant="additions" className={styles.container}>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            dismissing={toast.dismissing}
            message={toast.message}
            onClose={() => dismissToast(toast.id)}
            variant={toast.variant}
          />
        ))}
      </div>
    </ToastContext.Provider>
  )
}
