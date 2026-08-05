import axios from 'axios'

import { showToast } from '../../components/toast/toast.service'
import { isLoginRoute, redirectToLogin } from '../../router/navigation'
import { resetAppState } from '../../store/app.actions'
import { store } from '../../store/store'
import type { RequestMethod } from '../enum/request-methods'

axios.defaults.baseURL =
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
axios.defaults.withCredentials = true

axios.defaults.headers.common['Content-Type'] = 'application/json'

type ApiErrorResponse = {
  message?: string
}

export type RequestError = {
  error: true
  message: string
}

interface RequestOptions {
  method: RequestMethod
  route: string
  body?: unknown
  handleUnauthorized?: boolean
  showErrorToast?: boolean
}

export const request = async <T = unknown>({
  method,
  route,
  body,
  handleUnauthorized = true,
  showErrorToast = true,
}: RequestOptions): Promise<T | RequestError> => {
  try {
    const response = await axios.request<T>({
      method,
      url: route,
      data: body,
    })

    return response.data
  } catch (error: unknown) {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
      if (handleUnauthorized && error.response?.status === 401) {
        store.dispatch(resetAppState())

        if (!isLoginRoute()) {
          redirectToLogin()
        }
      }

      const message =
        error.response?.data?.message || error.message || 'Unknown error'

      if (showErrorToast) {
        showToast(message, 'error')
      }

      return {
        error: true,
        message,
      }
    }

    const message = error instanceof Error ? error.message : 'Unknown error'

    if (showErrorToast) {
      showToast(message, 'error')
    }

    return {
      error: true,
      message,
    }
  }
}
