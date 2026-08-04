import type { ChangeEvent, ReactNode } from 'react'

type AuthInputProps = {
  label: string
  name: string
  type: string
  value: string
  placeholder: string
  required?: boolean
  error?: string
  trailingAction?: ReactNode
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
}

export function AuthInput({
  label,
  name,
  type,
  value,
  placeholder,
  required = false,
  error,
  trailingAction,
  onChange,
}: AuthInputProps) {
  return (
    <label className="auth-field">
      <span className="auth-field__label">
        {label}
        {required ? <span className="auth-field__required">*</span> : null}
      </span>

      <span
        className={`auth-field__control ${error ? 'auth-field__control--error' : ''}`}
      >
        <input
          className="auth-field__input"
          name={name}
          type={type}
          value={value}
          placeholder={placeholder}
          autoComplete={name === 'password' ? 'current-password' : 'email'}
          onChange={onChange}
        />
        {trailingAction}
      </span>

      {error ? <span className="auth-field__error">{error}</span> : null}
    </label>
  )
}
