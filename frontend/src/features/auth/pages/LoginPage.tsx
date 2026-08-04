import { Navigate, useNavigate } from 'react-router'

import { useAppSelector } from '../../../store/hooks'
import { AuthForm } from '../components/AuthForm'
import './LoginPage.css'

export function LoginPage() {
  const navigate = useNavigate()
  const { status, user } = useAppSelector((state) => state.auth)

  if (status === 'authenticated' && user) {
    return <Navigate to="/" replace />
  }

  return (
    <main className="auth-page">
      <AuthForm onSuccess={() => navigate('/')} />
    </main>
  )
}
