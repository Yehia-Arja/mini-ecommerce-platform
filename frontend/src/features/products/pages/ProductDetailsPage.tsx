import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'

import { AppSpinner } from '../../../components/ui/AppSpinner'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { clearSelectedProduct } from '../store/products.slice'
import { fetchProductByIdThunk } from '../store/products.thunks'
import type { ProductImage, ProductVariant } from '../types/products.types'
import {
  formatProductPrice,
  getProductVariantSummary,
} from '../utils/product-formatters'
import './ProductsPage.css'

function getProductHeroImage(images: ProductImage[], fallbackImageUrl: string | null) {
  const primaryImage = images.find((image) => image.isPrimary)

  return primaryImage?.imageUrl ?? images[0]?.imageUrl ?? fallbackImageUrl
}

function getProductAvailabilityLabel(variants: ProductVariant[]) {
  if (!variants.length) {
    return 'No variants listed yet'
  }

  const inStockVariants = variants.filter((variant) => variant.stockQuantity > 0).length

  return inStockVariants > 0
    ? `${inStockVariants} in-stock variant${inStockVariants === 1 ? '' : 's'}`
    : 'Currently out of stock'
}

function getStartingPriceLabel(price: number, variants: ProductVariant[]) {
  const prices = variants.map((variant) => variant.price)
  const lowestPrice = prices.length ? Math.min(price, ...prices) : price

  return `${formatProductPrice(lowestPrice)} / item`
}

export function ProductDetailsPage() {
  const dispatch = useAppDispatch()
  const { productId } = useParams<{ productId: string }>()
  const { errorMessage, item, status } = useAppSelector(
    (state) => state.products.selectedProduct,
  )
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  useEffect(() => {
    if (!productId) {
      return
    }

    void dispatch(fetchProductByIdThunk(productId))

    return () => {
      dispatch(clearSelectedProduct())
    }
  }, [dispatch, productId])

  if (!productId) {
    return (
      <main className="products-page">
        <div className="products-page__container">
          <section className="products-status products-status--error" role="alert">
            <div>
              <h2>We could not identify this product.</h2>
              <p>The product link is incomplete.</p>
            </div>

            <Link className="products-status__link" to="/">
              Back to catalog
            </Link>
          </section>
        </div>
      </main>
    )
  }

  if (status === 'idle' || status === 'loading') {
    return (
      <main className="products-page">
        <div className="products-page__container">
          <section className="product-details product-details--loading">
            <AppSpinner label="Loading product details" size="md" tone="primary" />
          </section>
        </div>
      </main>
    )
  }

  if (errorMessage || !item) {
    return (
      <main className="products-page">
        <div className="products-page__container">
          <section className="products-status products-status--error" role="alert">
            <div>
              <h2>We could not load this product.</h2>
              <p>{errorMessage ?? 'The product is unavailable right now.'}</p>
            </div>

            <div className="products-status__actions">
              <button
                className="products-status__action"
                type="button"
                onClick={() => void dispatch(fetchProductByIdThunk(productId))}
              >
                Try again
              </button>

              <Link className="products-status__link" to="/">
                Back to catalog
              </Link>
            </div>
          </section>
        </div>
      </main>
    )
  }

  const galleryImages = item.images.length
    ? item.images
    : item.imageUrl
      ? [
          {
            id: null,
            imageUrl: item.imageUrl,
            displayOrder: 0,
            isPrimary: true,
          },
        ]
      : []
  const safeSelectedImageIndex =
    galleryImages.length > 0
      ? Math.min(selectedImageIndex, galleryImages.length - 1)
      : 0
  const selectedImage = galleryImages[safeSelectedImageIndex]
  const heroImageUrl =
    selectedImage?.imageUrl ?? getProductHeroImage(item.images, item.imageUrl)
  const primaryVariant = item.variants[0] ?? null

  return (
    <main className="products-page">
      <div className="products-page__container">
        <nav className="products-breadcrumb" aria-label="Breadcrumb">
          <Link className="products-breadcrumb__link" to="/">
            Catalog
          </Link>
          <span className="products-breadcrumb__separator">/</span>
          <span className="products-breadcrumb__current">{item.title}</span>
        </nav>

        <section className="product-details">
          <div className="product-details__media">
            <div className="product-details__media-frame">
              {heroImageUrl ? (
                <img
                  className="product-details__image"
                  src={heroImageUrl}
                  alt={item.title}
                />
              ) : (
                <div className="product-details__image product-details__image--placeholder">
                  <span>{item.title.charAt(0)}</span>
                </div>
              )}
            </div>

            {galleryImages.length > 1 ? (
              <div className="product-details__gallery" aria-label="Product gallery">
                {galleryImages.map((image, index) => (
                  <button
                    key={image.id ?? image.imageUrl}
                    className={
                      index === safeSelectedImageIndex
                        ? 'product-details__gallery-button product-details__gallery-button--active'
                        : 'product-details__gallery-button'
                    }
                    type="button"
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <img
                      className="product-details__gallery-image"
                      src={image.imageUrl}
                      alt={`${item.title} preview ${index + 1}`}
                    />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="product-details__content">
            <div className="product-details__header">
              <span className="products-page__eyebrow">Product Details</span>
              <h1>{item.title}</h1>
              <div className="product-details__price-block">
                <strong>{getStartingPriceLabel(item.price, item.variants)}</strong>
                <span>{getProductAvailabilityLabel(item.variants)}</span>
              </div>
              <p>{item.description}</p>
            </div>

            <div className="product-details__facts" aria-label="Product facts">
              <div className="product-details__fact-row">
                <span>Base price</span>
                <strong>{formatProductPrice(item.price)}</strong>
              </div>
              <div className="product-details__fact-row">
                <span>Variants</span>
                <strong>{getProductVariantSummary(item.variants.length)}</strong>
              </div>
              <div className="product-details__fact-row">
                <span>Featured option</span>
                <strong>{primaryVariant?.name ?? 'Standard product'}</strong>
              </div>
              <div className="product-details__fact-row">
                <span>Option code</span>
                <strong>{primaryVariant?.code ?? 'N/A'}</strong>
              </div>
              <div className="product-details__fact-row">
                <span>Inventory</span>
                <strong>{getProductAvailabilityLabel(item.variants)}</strong>
              </div>
              <div className="product-details__fact-row">
                <span>Product ID</span>
                <strong>{item.id}</strong>
              </div>
            </div>

            <section className="product-details__section" aria-labelledby="product-variants">
              <div className="product-details__section-header">
                <h2 id="product-variants">Available options</h2>
                <p>Select from the active variants returned by the backend response.</p>
              </div>

              {item.variants.length ? (
                <div className="product-variants-list">
                  {item.variants.map((variant) => (
                    <article className="product-variant-card" key={variant.id}>
                      <div>
                        <h3>{variant.name}</h3>
                        <p>{variant.code}</p>
                      </div>

                      <div className="product-variant-card__meta">
                        <strong>{formatProductPrice(variant.price)}</strong>
                        <span>{variant.stockQuantity} in stock</span>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="products-empty products-empty--compact">
                  <h2>No variants available right now.</h2>
                  <p>Check back later for updated inventory and configuration options.</p>
                </div>
              )}
            </section>

            <div className="product-details__actions">
              <Link className="product-details__primary-action" to="/">
                Back to catalog
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
