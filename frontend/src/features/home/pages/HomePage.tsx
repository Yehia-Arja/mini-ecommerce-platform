import { useEffect } from 'react'
import { Link } from 'react-router'

import {
  fetchProductsThunk,
  ProductsCatalog,
  type ProductListItem,
} from '../../products'
import '../../products/pages/ProductsPage.css'
import './HomePage.css'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { formatProductPrice } from '../../products/utils/product-formatters'

function getProductImage(product: ProductListItem) {
  const primaryImage = product.images.find((image) => image.isPrimary)

  return primaryImage?.imageUrl ?? product.imageUrl
}

function HomeSectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="home-section-header">
      <span className="home-section-header__eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
    </div>
  )
}

export function HomePage() {
  const dispatch = useAppDispatch()
  const { errorMessage, items, status } = useAppSelector(
    (state) => state.products.catalog,
  )
  const isLoading = status === 'idle' || status === 'loading'
  const heroProducts = items.slice(0, 3)
  const featuredProducts = items.slice(0, 12)

  useEffect(() => {
    if (status === 'idle') {
      void dispatch(
        fetchProductsThunk({
          page: 1,
          pageSize: 15,
        }),
      )
    }
  }, [dispatch, status])

  return (
    <main className="home-page">
      <div className="home-page__container">
        <section className="home-hero">
          <div className="home-hero__copy">
            <span className="home-hero__eyebrow">Mini Ecommerce</span>
            <h1>Front-row selections for everyday shopping.</h1>
            <p>
              Browse standout products, explore the details, and find your next pick
              in one clean, easy-to-shop view.
            </p>

            <div className="home-hero__actions">
              <a
                className="home-hero__action home-hero__action--primary"
                href="#featured-products"
              >
                Shop the selection
              </a>
              <Link className="home-hero__action home-hero__action--secondary" to="/cart">
                View cart
              </Link>
              <Link className="home-hero__action home-hero__action--secondary" to="/wishlist">
                View wishlist
              </Link>
            </div>
          </div>

          <div className="home-hero__showcase" aria-label="Featured product showcase">
            <div className="home-hero__showcase-grid">
              {heroProducts.map((product, index) => {
                const imageUrl = getProductImage(product)

                return (
                  <Link
                    key={product.id}
                    className={
                      index === 0
                        ? 'home-hero__showcase-card home-hero__showcase-card--featured'
                        : 'home-hero__showcase-card'
                    }
                    to={`/products/${product.id}`}
                  >
                    {imageUrl ? (
                      <img src={imageUrl} alt={product.title} />
                    ) : (
                      <div className="home-hero__showcase-placeholder">
                        <span>{product.title.charAt(0)}</span>
                      </div>
                    )}

                    <div className="home-hero__showcase-overlay">
                      <span>{formatProductPrice(product.price)}</span>
                      <strong>{product.title}</strong>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        {errorMessage ? (
          <section className="products-status products-status--error" role="alert">
            <div>
              <h2>We could not load the catalog.</h2>
              <p>{errorMessage}</p>
            </div>

            <button
              className="products-status__action"
              type="button"
              onClick={() =>
                void dispatch(
                  fetchProductsThunk({
                    page: 1,
                    pageSize: 15,
                  }),
                )
              }
            >
              Try again
            </button>
          </section>
        ) : null}

        <section className="home-section" id="featured-products">
          <HomeSectionHeader
            eyebrow="Featured Picks"
            title="Front-row selections"
          />

          <ProductsCatalog
            products={featuredProducts}
            isLoading={isLoading}
          />
        </section>
      </div>
    </main>
  )
}
