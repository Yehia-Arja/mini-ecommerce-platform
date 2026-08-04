import { useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import type { ZodFormattedError } from 'zod'

import { AppSpinner } from '../../../components/ui/AppSpinner'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { loginFormSchema } from '../schemas/auth.schema'
import { clearAuthFeedback } from '../store/auth.slice'
import { fetchCurrentUserThunk, loginThunk } from '../store/auth.thunks'
import type {
  LoginFormErrors,
  LoginFormValues,
} from '../types/auth.types'
import { AuthInput } from './AuthInput'

type AuthFormProps = {
  onSuccess: () => void
}

const initialValues: LoginFormValues = {
  email: '',
  password: '',
}

function mapLoginErrors(error: ZodFormattedError<LoginFormValues>) {
  return {
    email: error.email?._errors[0],
    password: error.password?._errors[0],
  } satisfies LoginFormErrors
}

function getValidationErrors(values: LoginFormValues) {
  const validationResult = loginFormSchema.safeParse(values)

  if (validationResult.success) {
    return {} as LoginFormErrors
  }

  return mapLoginErrors(validationResult.error.format())
}

function PasswordVisibilityButton({
  isVisible,
  onToggle,
}: {
  isVisible: boolean
  onToggle: () => void
}) {
  return (
    <button
      className="auth-field__toggle"
      type="button"
      onClick={onToggle}
      aria-label={isVisible ? 'Hide password' : 'Show password'}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        {isVisible ? (
          <>
            <path
              d="M3.28 2.22 1.86 3.64l3 3C2.97 8.03 1.64 9.85 1 12c1.1 3.7 5.5 7 11 7 2.22 0 4.23-.54 5.98-1.5l3.16 3.16 1.41-1.41L3.28 2.22Zm8.72 14.78c-2.99 0-5.52-2.01-6.43-4.72.44-1.31 1.28-2.5 2.38-3.42l1.67 1.67a4.2 4.2 0 0 0 5.85 5.85l1.08 1.08A8.9 8.9 0 0 1 12 17Zm-.17-5.83 2 2a2.3 2.3 0 0 1-2-2Zm10.17.83c-.63-2.12-1.94-3.92-3.8-5.33A10.91 10.91 0 0 0 12 5c-1.4 0-2.73.21-3.98.6l1.67 1.67c.73-.18 1.5-.27 2.31-.27 3.27 0 6.04 1.84 7.02 5-.36 1.16-1.02 2.22-1.9 3.09l1.43 1.43A10.74 10.74 0 0 0 23 12Z"
              fill="currentColor"
            />
          </>
        ) : (
          <path
            d="M12 5C6.5 5 2.1 8.3 1 12c1.1 3.7 5.5 7 11 7s9.9-3.3 11-7c-1.1-3.7-5.5-7-11-7Zm0 11.2A4.2 4.2 0 1 1 12 7.8a4.2 4.2 0 0 1 0 8.4Zm0-1.9a2.3 2.3 0 1 0 0-4.6 2.3 2.3 0 0 0 0 4.6Z"
            fill="currentColor"
          />
        )}
      </svg>
    </button>
  )
}

export function AuthForm({ onSuccess }: AuthFormProps) {
  const dispatch = useAppDispatch()
  const { errorMessage, infoMessage, status } = useAppSelector(
    (state) => state.auth,
  )
  const [values, setValues] = useState<LoginFormValues>(initialValues)
  const [errors, setErrors] = useState<LoginFormErrors>({})
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const isFormValid = loginFormSchema.safeParse(values).success

  useEffect(() => {
    return () => {
      dispatch(clearAuthFeedback())
    }
  }, [dispatch])

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target
    const fieldName = name as keyof LoginFormValues
    const nextValues = {
      ...values,
      [fieldName]: value,
    }

    setValues(nextValues)

    const nextErrors = getValidationErrors(nextValues)

    setErrors((current) => ({
      ...current,
      [fieldName]: nextErrors[fieldName],
    }))

    if (errorMessage || infoMessage) {
      dispatch(clearAuthFeedback())
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const validationResult = loginFormSchema.safeParse(values)

    if (!validationResult.success) {
      setErrors(mapLoginErrors(validationResult.error.format()))
      return
    }

    setErrors({})

    const resultAction = await dispatch(
      loginThunk({
        email: validationResult.data.email,
        password: validationResult.data.password,
      }),
    )

    if (!loginThunk.fulfilled.match(resultAction)) {
      return
    }

    const sessionResult = await dispatch(fetchCurrentUserThunk())

    if (fetchCurrentUserThunk.fulfilled.match(sessionResult)) {
      setValues(initialValues)
      setIsPasswordVisible(false)
      onSuccess()
    }
  }

  return (
    <div className="auth-card">
      <div className="auth-card__header">
        <h1>Welcome back</h1>
        <p>Sign in to browse products, manage orders, and continue checkout.</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <AuthInput
          label="Email Address"
          name="email"
          type="email"
          value={values.email}
          placeholder="Enter your email address"
          required
          error={errors.email}
          onChange={handleChange}
        />

        <AuthInput
          label="Password"
          name="password"
          type={isPasswordVisible ? 'text' : 'password'}
          value={values.password}
          placeholder="Enter your password"
          required
          error={errors.password}
          trailingAction={
            <PasswordVisibilityButton
              isVisible={isPasswordVisible}
              onToggle={() => setIsPasswordVisible((current) => !current)}
            />
          }
          onChange={handleChange}
        />

        {errorMessage ? (
          <p className="auth-feedback auth-feedback--error" role="alert">
            {errorMessage}
          </p>
        ) : null}

        {infoMessage ? (
          <p className="auth-feedback auth-feedback--info" role="status">
            {infoMessage}
          </p>
        ) : null}

        <button
          className="auth-submit"
          type="submit"
          disabled={status === 'submitting' || !isFormValid}
        >
          {status === 'submitting' ? <AppSpinner label="Logging in" /> : 'Login'}
        </button>
      </form>
    </div>
  )
}
