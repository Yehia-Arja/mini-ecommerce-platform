import { requestMethods } from '../../../utils/enum/request-methods'
import { request, type RequestError } from '../../../utils/remote/axios'
import type { OrderSuccessResponse } from '../types/orders.types'

const ORDERS_ROUTE = '/orders'

function isRequestError(value: unknown): value is RequestError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'error' in value &&
    value.error === true
  )
}

export async function placeOrder() {
  const response = await request<OrderSuccessResponse>({
    method: requestMethods.POST,
    route: ORDERS_ROUTE,
  })

  if (isRequestError(response)) {
    return response
  }

  return response
}

export async function fetchOrderById(orderId: string) {
  const response = await request<OrderSuccessResponse>({
    method: requestMethods.GET,
    route: `${ORDERS_ROUTE}/${orderId}`,
  })

  if (isRequestError(response)) {
    return response
  }

  return response
}
