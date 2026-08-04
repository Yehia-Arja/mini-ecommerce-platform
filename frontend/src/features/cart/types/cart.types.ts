export type CartProductSummary = {
  id: string
  title: string
  imageUrl: string | null
}

export type CartVariantSummary = {
  id: string
  name: string
  code: string
  price: number
  overridePrice: number | null
  stockQuantity: number
}

export type CartItem = {
  id: string
  quantity: number
  unitPrice: number
  subtotal: number
  product: CartProductSummary
  variant: CartVariantSummary
}

export type Cart = {
  id: string
  userId: string
  status: 'active' | 'converted' | 'abandoned'
  items: CartItem[]
  totalQuantity: number
  total: number
  createdAt: string
  updatedAt: string
}

export type CartSuccessResponse = {
  success: true
  message: string
  data: Cart
}

export type CartStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

export type CartState = {
  item: Cart | null
  status: CartStatus
  mutationStatus: 'idle' | 'loading'
  activeItemId: string | null
  activeVariantId: string | null
  errorMessage: string | null
  infoMessage: string | null
}
