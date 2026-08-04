import type { ProductListItem } from '../../products/types/products.types'

export type WishlistItem = {
  id: string
  createdAt: string
  product: ProductListItem
}

export type Wishlist = {
  userId: string
  items: WishlistItem[]
  totalItems: number
}

export type WishlistSuccessResponse = {
  success: true
  message: string
  data: Wishlist
}

export type WishlistStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

export type WishlistState = {
  item: Wishlist | null
  status: WishlistStatus
  currentFetchRequestId: string | null
  mutationStatus: 'idle' | 'loading'
  activeItemId: string | null
  activeProductId: string | null
  errorMessage: string | null
  infoMessage: string | null
}
