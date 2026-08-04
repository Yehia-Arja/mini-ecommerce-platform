export { fetchProducts } from './services/products.service'
export { ProductsCatalog } from './components/ProductsCatalog'
export { productsReducer } from './store/products.slice'
export { fetchProductsThunk } from './store/products.thunks'
export type {
  ProductImage,
  ProductListItem,
  ProductVariant,
  ProductsListParams,
  ProductsListResponse,
  ProductsPaginationMeta,
  ProductsState,
  ProductsStatus,
  ProductsSuccessResponse,
} from './types/products.types'
