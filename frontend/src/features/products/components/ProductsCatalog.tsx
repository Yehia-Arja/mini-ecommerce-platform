import type { ProductListItem } from '../types/products.types'
import { ProductCard } from './ProductCard'
import { ProductCardSkeleton } from './ProductCardSkeleton'

type ProductsCatalogProps = {
  products: ProductListItem[]
  isLoading?: boolean
}

const SKELETON_COUNT = 6

export function ProductsCatalog({
  products,
  isLoading = false,
}: ProductsCatalogProps) {
  if (isLoading) {
    return (
      <section className="products-grid" aria-label="Loading products">
        {Array.from({ length: SKELETON_COUNT }, (_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </section>
    )
  }

  if (!products.length) {
    return (
      <section className="products-empty" aria-live="polite">
        <span className="products-empty__badge">Catalog</span>
        <h2>No products available right now.</h2>
        <p>
          Check back in a bit to explore the latest arrivals and everyday
          essentials.
        </p>
      </section>
    )
  }

  return (
    <section className="products-grid" aria-label="Product catalog">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </section>
  )
}
