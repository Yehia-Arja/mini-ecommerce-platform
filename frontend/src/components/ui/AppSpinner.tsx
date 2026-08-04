import './AppSpinner.css'

type AppSpinnerProps = {
  label?: string
  size?: 'sm' | 'md'
  tone?: 'primary' | 'inverse'
}

export function AppSpinner({
  label = 'Loading',
  size = 'md',
  tone = 'inverse',
}: AppSpinnerProps) {
  return (
    <span
      className={`app-spinner app-spinner--${size} app-spinner--${tone}`}
      aria-label={label}
      role="status"
    />
  )
}
