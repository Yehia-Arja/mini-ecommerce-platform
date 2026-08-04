import { requestMethods } from '../../../utils/enum/request-methods'
import { request, type RequestError } from '../../../utils/remote/axios'
import type { CartSuccessResponse } from '../types/cart.types'

const CART_ROUTE = '/cart'

type AddCartItemPayload = {
  productVariantId: string
  quantity: number
}

type UpdateCartItemPayload = {
  cartItemId: string
  quantity?: number
  productVariantId?: string
}

function isRequestError(value: unknown): value is RequestError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'error' in value &&
    value.error === true
  )
}

export async function fetchCart() {
  const response = await request<CartSuccessResponse>({
    method: requestMethods.GET,
    route: CART_ROUTE,
  })

  if (isRequestError(response)) {
    return response
  }

  return response
}

export async function addCartItem(payload: AddCartItemPayload) {
  const response = await request<CartSuccessResponse>({
    method: requestMethods.POST,
    route: `${CART_ROUTE}/items`,
    body: payload,
  })

  if (isRequestError(response)) {
    return response
  }

  return response
}

export async function updateCartItem(payload: UpdateCartItemPayload) {
  const { cartItemId, ...body } = payload
  const response = await request<CartSuccessResponse>({
    method: requestMethods.PATCH,
    route: `${CART_ROUTE}/items/${cartItemId}`,
    body,
  })

  if (isRequestError(response)) {
    return response
  }

  return response
}

export async function removeCartItem(cartItemId: string) {
  const response = await request<void>({
    method: requestMethods.DELETE,
    route: `${CART_ROUTE}/items/${cartItemId}`,
  })

  if (isRequestError(response)) {
    return response
  }

  return response
}
