export { fetchProducts } from './services/products.service'
export { fetchProductById } from './services/products.service'
export { ProductsCatalog } from './components/ProductsCatalog'
export { ProductDetailsPage } from './pages/ProductDetailsPage'
export { clearSelectedProduct, productsReducer } from './store/products.slice'
export { fetchProductByIdThunk, fetchProductsThunk } from './store/products.thunks'
export type {
  ProductImage,
  ProductListItem,
  ProductVariant,
  ProductDetailsResponse,
  ProductsCatalogState,
  ProductsListParams,
  ProductsListResponse,
  ProductsPaginationMeta,
  ProductsState,
  ProductsStatus,
  ProductsSuccessResponse,
  SelectedProductState,
} from './types/products.types'
