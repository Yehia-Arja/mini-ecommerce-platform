import { requestMethods } from '../../../utils/enum/request-methods'
import { request, type RequestError } from '../../../utils/remote/axios'
import type {
  ProductsListParams,
  ProductsSuccessResponse,
} from '../types/products.types'

const PRODUCTS_ROUTE = '/products'

function isRequestError(value: unknown): value is RequestError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'error' in value &&
    value.error === true
  )
}

function buildProductsRoute(params?: ProductsListParams) {
  const searchParams = new URLSearchParams()

  if (params?.page) {
    searchParams.set('page', String(params.page))
  }

  if (params?.pageSize) {
    searchParams.set('pageSize', String(params.pageSize))
  }

  const query = searchParams.toString()

  return query ? `${PRODUCTS_ROUTE}?${query}` : PRODUCTS_ROUTE
}

export async function fetchProducts(params?: ProductsListParams) {
  const response = await request<ProductsSuccessResponse>({
    method: requestMethods.GET,
    route: buildProductsRoute(params),
  })

  if (isRequestError(response)) {
    return response
  }

  return response
}
