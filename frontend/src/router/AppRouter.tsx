import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router'

import { LoginPage } from '../features/auth'
import { fetchCurrentUserThunk } from '../features/auth/store/auth.thunks'
import { HomePage } from '../features/home/pages/HomePage'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { ProtectedRoute } from './ProtectedRoute'

export function AppRouter() {
  const dispatch = useAppDispatch()
  const status = useAppSelector((state) => state.auth.status)

  useEffect(() => {
    if (status === 'idle') {
      void dispatch(fetchCurrentUserThunk())
    }
  }, [dispatch, status])

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
