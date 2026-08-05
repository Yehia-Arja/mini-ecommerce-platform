import type { ToastVariant } from './context'

type ToastHandler = (message: string, variant: ToastVariant) => void

let toastHandler: ToastHandler | null = null

export function registerToastHandler(handler: ToastHandler | null) {
  toastHandler = handler
}

export function showToast(message: string, variant: ToastVariant) {
  toastHandler?.(message, variant)
}
