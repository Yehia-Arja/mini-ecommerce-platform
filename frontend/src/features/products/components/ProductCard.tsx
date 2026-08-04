import { Link } from 'react-router'

import { WishlistToggleButton } from '../../wishlist'
import type { ProductListItem } from '../types/products.types'
import {
  formatProductPrice,
  getProductVariantSummary,
} from '../utils/product-formatters'

type ProductCardProps = {
  product: ProductListItem
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
          <span className="product-card__price">
            {formatProductPrice(product.price)}
          </span>
        </div>

        <div className="product-card__copy">
          <h2>{product.title}</h2>
          <p>{product.description}</p>
        </div>

        <div className="product-card__footer">
          <span className="product-card__variants">
            {getProductVariantSummary(product.variants.length)}
          </span>

          <div className="product-card__actions">
            <WishlistToggleButton
              className="product-card__wishlist-action"
              productId={product.id}
              productTitle={product.title}
            />

            <Link className="product-card__link" to={`/products/${product.id}`}>
              View details
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}
