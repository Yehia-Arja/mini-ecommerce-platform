import type { ReactNode } from 'react'
import { Navigate } from 'react-router'

import { AppSpinner } from '../components/ui/AppSpinner'
import { useAppSelector } from '../store/hooks'
import './router.css'

type ProtectedRouteProps = {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { status, user } = useAppSelector((state) => state.auth)
  const isCheckingAuth = status === 'idle' || status === 'checking'

  return isCheckingAuth ? (
    <main className="route-status-page">
      <AppSpinner label="Checking session" size="md" tone="primary" />
    </main>
  ) : user ? (
    <>{children}</>
  ) : (
    <Navigate to="/login" replace />
  )
}
