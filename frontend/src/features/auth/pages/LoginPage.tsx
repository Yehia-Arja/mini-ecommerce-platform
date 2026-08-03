import { AuthForm } from '../components/AuthForm'
import './LoginPage.css'

type LoginPageProps = {
  onSuccess: () => void
}

export function LoginPage({ onSuccess }: LoginPageProps) {
  return (
    <main className="auth-page">
      <AuthForm onSuccess={onSuccess} />
    </main>
  )
}
