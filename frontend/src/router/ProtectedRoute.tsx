import { useEffect } from 'react'
import type { ReactNode } from 'react'

import { AppSpinner } from '../components/ui/AppSpinner'
import { useAppSelector } from '../store/hooks'
import './router.css'

type ProtectedRouteProps = {
  children: ReactNode
  onUnauthorized: () => void
}

export function ProtectedRoute({
  children,
  onUnauthorized,
}: ProtectedRouteProps) {
  const { status, user } = useAppSelector((state) => state.auth)

  useEffect(() => {
    if (status !== 'idle' && status !== 'checking' && !user) {
      onUnauthorized()
    }
  }, [onUnauthorized, status, user])

  if (status === 'idle' || status === 'checking') {
    return (
      <main className="route-status-page">
        <AppSpinner label="Checking session" size="md" tone="primary" />
      </main>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}
