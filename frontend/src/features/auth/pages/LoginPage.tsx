import { useNavigate } from 'react-router'

import { AuthForm } from '../components/AuthForm'
import './LoginPage.css'

export function LoginPage() {
  const navigate = useNavigate()

  return (
    <main className="auth-page">
      <AuthForm onSuccess={() => navigate('/')} />
    </main>
  )
}
