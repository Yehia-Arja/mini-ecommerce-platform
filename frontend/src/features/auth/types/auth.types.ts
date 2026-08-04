import type { z } from 'zod'

import type { loginFormSchema } from '../schemas/auth.schema'

export type AuthUser = {
  id: string
  firstName: string
  lastName: string | null
  email: string
  phoneNumber: string | null
  status: 'active' | 'pending' | 'suspended'
  emailVerifiedAt: string | null
  userType: string
  loginCount: number
  lastLoginIp: string | null
  lastLoginAt: string | null
  language: string
  countryCode: string | null
  registrationIp: string | null
  createdAt: string
  updatedAt: string
}

export type LoginPayload = {
  email: string
  password: string
}

export type AuthSuccessResponse<T> = {
  success: true
  message: string
  data: T
}

export type AuthUserResponse = AuthSuccessResponse<{
  user: AuthUser
}>

export type AuthStatus =
  | 'idle'
  | 'checking'
  | 'submitting'
  | 'authenticated'
  | 'unauthenticated'

export type AuthState = {
  user: AuthUser | null
  status: AuthStatus
  currentRequestId: string | null
  currentRequestType: 'session' | 'login' | 'logout' | null
  errorMessage: string | null
  infoMessage: string | null
}

export type LoginFormValues = z.input<typeof loginFormSchema>

export type LoginFormErrors = Partial<Record<keyof LoginFormValues, string>>
