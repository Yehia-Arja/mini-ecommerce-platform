export const requestMethods = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
} as const

export type RequestMethod =
  (typeof requestMethods)[keyof typeof requestMethods]
