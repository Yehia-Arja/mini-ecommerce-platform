import axios from 'axios'

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
}

export const request = async <T = unknown>({
  method,
  route,
  body,
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
      return {
        error: true,
        message:
          error.response?.data?.message || error.message || 'Unknown error',
      }
    }

    return {
      error: true,
      message: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
