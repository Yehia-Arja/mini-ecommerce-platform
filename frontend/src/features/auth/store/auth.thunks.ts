import { createAsyncThunk } from '@reduxjs/toolkit'

import {
  fetchCurrentUser,
  loginUser,
  logoutUser,
} from '../services/auth.service'
import type { AuthUser, LoginPayload } from '../types/auth.types'

export const loginThunk = createAsyncThunk<
  { user: AuthUser; message: string },
  LoginPayload,
  { rejectValue: string }
>('auth/login', async (payload, { rejectWithValue }) => {
  const response = await loginUser(payload)

  if ('error' in response) {
    return rejectWithValue(response.message)
  }

  return {
    user: response.data.user,
    message: response.message,
  }
})

export const fetchCurrentUserThunk = createAsyncThunk<
  AuthUser,
  void,
  { rejectValue: string }
>('auth/me', async (_, { rejectWithValue }) => {
  const response = await fetchCurrentUser()

  if ('error' in response) {
    return rejectWithValue(response.message)
  }

  return response.data.user
})

export const logoutThunk = createAsyncThunk<void, void, { rejectValue: string }>(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    const response = await logoutUser()

    if ('error' in response) {
      return rejectWithValue(response.message)
    }
  },
)
