import { createSlice } from '@reduxjs/toolkit'

import type { AuthState } from '../types/auth.types'
import {
  fetchCurrentUserThunk,
  loginThunk,
  logoutThunk,
} from './auth.thunks'

const initialState: AuthState = {
  user: null,
  status: 'idle',
  errorMessage: null,
  infoMessage: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthFeedback(state) {
      state.errorMessage = null
      state.infoMessage = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUserThunk.pending, (state) => {
        state.status = 'checking'
        state.errorMessage = null
      })
      .addCase(fetchCurrentUserThunk.fulfilled, (state, action) => {
        state.status = 'authenticated'
        state.user = action.payload
        state.errorMessage = null
      })
      .addCase(fetchCurrentUserThunk.rejected, (state, action) => {
        state.status = 'unauthenticated'
        state.user = null
        state.errorMessage = null

        if (action.payload && action.payload !== 'Authentication is required.') {
          state.infoMessage = action.payload
        }
      })
      .addCase(loginThunk.pending, (state) => {
        state.status = 'submitting'
        state.errorMessage = null
        state.infoMessage = null
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.status = 'authenticated'
        state.user = action.payload.user
        state.errorMessage = null
        state.infoMessage = action.payload.message
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.status = 'unauthenticated'
        state.user = null
        state.errorMessage = action.payload ?? 'Unable to sign in.'
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.status = 'unauthenticated'
        state.user = null
        state.errorMessage = null
        state.infoMessage = 'You have been signed out.'
      })
      .addCase(logoutThunk.rejected, (state, action) => {
        state.errorMessage = action.payload ?? 'Unable to sign out right now.'
      })
  },
})

export const { clearAuthFeedback } = authSlice.actions
export const authReducer = authSlice.reducer
