import { requestMethods } from '../../../utils/enum/request-methods'
import { request, type RequestError } from '../../../utils/remote/axios'
import type { WishlistSuccessResponse } from '../types/wishlist.types'

const WISHLIST_ROUTE = '/wishlist'

function isRequestError(value: unknown): value is RequestError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'error' in value &&
    value.error === true
  )
}

export async function fetchWishlist() {
  const response = await request<WishlistSuccessResponse>({
    method: requestMethods.GET,
    route: WISHLIST_ROUTE,
  })

  if (isRequestError(response)) {
    return response
  }

  return response
}

export async function addWishlistItem(productId: string) {
  const response = await request<WishlistSuccessResponse>({
    method: requestMethods.POST,
    route: `${WISHLIST_ROUTE}/items`,
    body: { productId },
  })

  if (isRequestError(response)) {
    return response
  }

  return response
}

export async function removeWishlistItem(wishlistItemId: string) {
  const response = await request<void | RequestError>({
    method: requestMethods.DELETE,
    route: `${WISHLIST_ROUTE}/items/${wishlistItemId}`,
  })

  if (isRequestError(response)) {
    return response
  }

  return response
}
