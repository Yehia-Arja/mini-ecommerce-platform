import { createSlice } from '@reduxjs/toolkit'

import { resetAppState } from '../../../store/app.actions'
import type { AuthState } from '../types/auth.types'
import {
  fetchCurrentUserThunk,
  loginThunk,
  logoutThunk,
} from './auth.thunks'

const initialState: AuthState = {
  user: null,
  status: 'idle',
  currentRequestId: null,
  currentRequestType: null,
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
      .addCase(fetchCurrentUserThunk.pending, (state, action) => {
        state.status = 'checking'
        state.currentRequestId = action.meta.requestId
        state.currentRequestType = 'session'
        state.errorMessage = null
      })
      .addCase(fetchCurrentUserThunk.fulfilled, (state, action) => {
        if (
          state.currentRequestId !== action.meta.requestId ||
          state.currentRequestType !== 'session'
        ) {
          return
        }

        state.status = 'authenticated'
        state.currentRequestId = null
        state.currentRequestType = null
        state.user = action.payload
        state.errorMessage = null
      })
      .addCase(fetchCurrentUserThunk.rejected, (state, action) => {
        if (
          state.currentRequestId !== action.meta.requestId ||
          state.currentRequestType !== 'session'
        ) {
          return
        }

        state.status = 'unauthenticated'
        state.currentRequestId = null
        state.currentRequestType = null
        state.user = null
        state.errorMessage = null
        state.infoMessage =
          action.payload && action.payload !== 'Authentication is required.'
            ? action.payload
            : null
      })
      .addCase(loginThunk.pending, (state, action) => {
        state.status = 'submitting'
        state.currentRequestId = action.meta.requestId
        state.currentRequestType = 'login'
        state.errorMessage = null
        state.infoMessage = null
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        if (
          state.currentRequestId !== action.meta.requestId ||
          state.currentRequestType !== 'login'
        ) {
          return
        }

        state.status = 'authenticated'
        state.currentRequestId = null
        state.currentRequestType = null
        state.user = action.payload.user
        state.errorMessage = null
        state.infoMessage = action.payload.message
      })
      .addCase(loginThunk.rejected, (state, action) => {
        if (
          state.currentRequestId !== action.meta.requestId ||
          state.currentRequestType !== 'login'
        ) {
          return
        }

        state.status = 'unauthenticated'
        state.currentRequestId = null
        state.currentRequestType = null
        state.user = null
        state.errorMessage = action.payload ?? 'Unable to sign in.'
      })
      .addCase(logoutThunk.pending, (state, action) => {
        state.currentRequestId = action.meta.requestId
        state.currentRequestType = 'logout'
      })
      .addCase(logoutThunk.fulfilled, (state, action) => {
        if (
          state.currentRequestId !== action.meta.requestId ||
          state.currentRequestType !== 'logout'
        ) {
          return
        }

        state.status = 'unauthenticated'
        state.currentRequestId = null
        state.currentRequestType = null
        state.user = null
        state.errorMessage = null
        state.infoMessage = 'You have been signed out.'
      })
      .addCase(logoutThunk.rejected, (state, action) => {
        if (
          state.currentRequestId !== action.meta.requestId ||
          state.currentRequestType !== 'logout'
        ) {
          return
        }

        state.currentRequestId = null
        state.currentRequestType = null
        state.errorMessage = action.payload ?? 'Unable to sign out right now.'
      })
      .addCase(resetAppState, () => initialState)
  },
})

export const { clearAuthFeedback } = authSlice.actions
export const authReducer = authSlice.reducer
