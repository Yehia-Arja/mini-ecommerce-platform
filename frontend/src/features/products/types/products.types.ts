export type ProductImage = {
  id: string | null
  imageUrl: string
  displayOrder: number
  isPrimary: boolean
}

export type ProductVariant = {
  id: string
  name: string
  code: string
  price: number
  overridePrice: number | null
  stockQuantity: number
  isActive: boolean
}

export type ProductListItem = {
  id: string
  title: string
  description: string
  price: number
  imageUrl: string | null
  images: ProductImage[]
  variants: ProductVariant[]
}

export type ProductsPaginationMeta = {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export type ProductsListResponse = {
  items: ProductListItem[]
  pagination: ProductsPaginationMeta
}

export type ProductsSuccessResponse = {
  success: true
  message: string
  data: ProductsListResponse
}

export type ProductDetailsResponse = {
  success: true
  message: string
  data: ProductListItem
}

export type ProductsListParams = {
  page?: number
  pageSize?: number
}

export type ProductsStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

export type ProductsCatalogState = {
  items: ProductListItem[]
  pagination: ProductsPaginationMeta | null
  status: ProductsStatus
  errorMessage: string | null
}

export type SelectedProductState = {
  currentProductId: string | null
  currentRequestId: string | null
  item: ProductListItem | null
  status: ProductsStatus
  errorMessage: string | null
}

export type ProductsState = {
  catalog: ProductsCatalogState
  selectedProduct: SelectedProductState
}
