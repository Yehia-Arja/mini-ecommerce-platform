import { memo, type ReactNode } from 'react'

import { CloseIcon } from '../icons/CloseIcon'
import type { ToastVariant } from './context'
import styles from './Toast.module.css'

interface ToastProps {
  message: string
  variant: ToastVariant
  dismissing?: boolean
  onClose: () => void
}

const SuccessIcon = memo(function SuccessIcon() {
  return (
    <svg fill="none" height="20" viewBox="0 0 20 20" width="20">
      <circle cx="10" cy="10" fill="currentColor" r="10" />
      <path
        d="M6 10.5L8.5 13L14 7.5"
        stroke="white"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  )
})

const ErrorIcon = memo(function ErrorIcon() {
  return (
    <svg fill="none" height="20" viewBox="0 0 20 20" width="20">
      <circle cx="10" cy="10" fill="currentColor" r="10" />
      <path d="M10 6V11" stroke="white" strokeLinecap="round" strokeWidth="2" />
      <circle cx="10" cy="13.5" fill="white" r="1" />
    </svg>
  )
})

const InfoIconCircle = memo(function InfoIconCircle() {
  return (
    <svg fill="none" height="20" viewBox="0 0 20 20" width="20">
      <circle cx="10" cy="10" fill="currentColor" r="10" />
      <circle cx="10" cy="6.5" fill="white" r="1" />
      <path d="M10 9V14" stroke="white" strokeLinecap="round" strokeWidth="2" />
    </svg>
  )
})

const VARIANT_ICON: Record<ToastVariant, ReactNode> = {
  success: <SuccessIcon />,
  error: <ErrorIcon />,
  info: <InfoIconCircle />,
}

export const Toast = memo(function Toast({
  message,
  variant,
  dismissing,
  onClose,
}: ToastProps) {
  const toastClasses = [styles.toast, styles[variant], dismissing ? styles.dismissing : '']
    .filter(Boolean)
    .join(' ')

  return (
    <div className={toastClasses} role="alert">
      <span className={styles.iconBadge}>{VARIANT_ICON[variant]}</span>
      <p className={styles.message}>{message}</p>
      <button
        aria-label="Close"
        className={styles.closeButton}
        onClick={onClose}
        type="button"
      >
        <CloseIcon size={14} />
      </button>
      <div className={styles.timerBar} />
    </div>
  )
})
