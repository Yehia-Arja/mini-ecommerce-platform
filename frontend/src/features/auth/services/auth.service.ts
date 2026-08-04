import { requestMethods } from '../../../utils/enum/request-methods'
import { request, type RequestError } from '../../../utils/remote/axios'
import type {
  AuthSuccessResponse,
  AuthUserResponse,
  LoginPayload,
} from '../types/auth.types'

function isRequestError(value: unknown): value is RequestError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'error' in value &&
    value.error === true
  )
}

const AUTH_ROUTE = '/auth'

export async function loginUser(payload: LoginPayload) {
  const response = await request<AuthUserResponse>({
    method: requestMethods.POST,
    route: `${AUTH_ROUTE}/login`,
    body: payload,
    handleUnauthorized: false,
  })

  if (isRequestError(response)) {
    return response
  }

  return response
}

export async function fetchCurrentUser() {
  const response = await request<AuthUserResponse>({
    method: requestMethods.GET,
    route: `${AUTH_ROUTE}/me`,
  })

  if (isRequestError(response)) {
    return response
  }

  return response
}

export async function logoutUser() {
  const response = await request<AuthSuccessResponse<null>>({
    method: requestMethods.POST,
    route: `${AUTH_ROUTE}/logout`,
  })

  if (isRequestError(response)) {
    return response
  }

  return response
}
