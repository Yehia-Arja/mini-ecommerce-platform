const LOGIN_ROUTE = '/login'

export function isLoginRoute() {
  return window.location.pathname === LOGIN_ROUTE
}

export function redirectToLogin() {
  if (isLoginRoute()) {
    return
  }

  window.location.replace(LOGIN_ROUTE)
}
