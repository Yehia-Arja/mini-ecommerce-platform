import type { ProductListItem } from '../types/products.types'

type ProductCardProps = {
  product: ProductListItem
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(price)
}

function getVariantSummary(product: ProductListItem) {
  if (product.variants.length <= 1) {
    return 'Ready to add to cart'
  }

  return `${product.variants.length} variants available`
}

export function ProductCard({ product }: ProductCardProps) {
  const primaryImage = product.images.find((image) => image.isPrimary)
  const imageUrl = primaryImage?.imageUrl ?? product.imageUrl

  return (
    <article className="product-card">
      <div className="product-card__media">
        {imageUrl ? (
          <img
            className="product-card__image"
            src={imageUrl}
            alt={product.title}
            loading="lazy"
          />
        ) : (
          <div className="product-card__image product-card__image--placeholder">
            <span>{product.title.charAt(0)}</span>
          </div>
        )}
      </div>

      <div className="product-card__body">
        <div className="product-card__meta">
          <span className="product-card__eyebrow">Featured Product</span>
          <span className="product-card__price">{formatPrice(product.price)}</span>
        </div>

        <div className="product-card__copy">
          <h2>{product.title}</h2>
          <p>{product.description}</p>
        </div>

        <div className="product-card__footer">
          <span className="product-card__variants">
            {getVariantSummary(product)}
          </span>
        </div>
      </div>
    </article>
  )
}
