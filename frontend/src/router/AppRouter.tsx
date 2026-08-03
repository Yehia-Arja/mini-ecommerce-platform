import { useEffect, useState } from 'react'

import { LoginPage } from '../features/auth'
import { fetchCurrentUserThunk } from '../features/auth/store/auth.thunks'
import { HomePage } from '../features/home/pages/HomePage'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { ProtectedRoute } from './ProtectedRoute'

const LOGIN_ROUTES = ['/login']

function normalizePath(pathname: string) {
  if (LOGIN_ROUTES.includes(pathname)) {
    return '/login'
  }

  return '/'
}

export function AppRouter() {
  const dispatch = useAppDispatch()
  const status = useAppSelector((state) => state.auth.status)
  const [pathname, setPathname] = useState(() =>
    normalizePath(window.location.pathname),
  )

  useEffect(() => {
    if (status === 'idle') {
      void dispatch(fetchCurrentUserThunk())
    }
  }, [dispatch, status])

  useEffect(() => {
    function handlePopState() {
      setPathname(normalizePath(window.location.pathname))
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  function navigate(path: '/' | '/login') {
    const nextPath = normalizePath(path)

    if (nextPath === pathname) {
      return
    }

    window.history.pushState({}, '', nextPath)
    setPathname(nextPath)
  }

  function replace(path: '/' | '/login') {
    const nextPath = normalizePath(path)

    if (nextPath === pathname) {
      return
    }

    window.history.replaceState({}, '', nextPath)
    setPathname(nextPath)
  }

  if (pathname === '/login') {
    return <LoginPage onSuccess={() => navigate('/')} />
  }

  return (
    <ProtectedRoute onUnauthorized={() => replace('/login')}>
      <HomePage />
    </ProtectedRoute>
  )
}
