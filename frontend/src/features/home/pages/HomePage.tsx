import { useEffect } from 'react'

import { fetchProductsThunk, ProductsCatalog } from '../../products'
import '../../products/pages/ProductsPage.css'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'

export function HomePage() {
  const dispatch = useAppDispatch()
  const { errorMessage, items, pagination, status } = useAppSelector(
    (state) => state.products,
  )

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
    <main className="products-page">
      <div className="products-page__container">
        <section className="products-page__hero">
          <div className="products-page__hero-copy">
            <span className="products-page__eyebrow">Mini Ecommerce</span>
            <h1>Shop everyday essentials, all in one place.</h1>
            <p>
              Discover well-made picks across home, style, and tech, with easy
              browsing, clear options, and a smooth path to checkout.
            </p>
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

        {pagination ? (
          <section className="products-summary" aria-label="Catalog summary">
            <p>
              Showing {items.length} of {pagination.totalItems} products
            </p>
          </section>
        ) : null}

        <ProductsCatalog
          products={items}
          isLoading={status === 'idle' || status === 'loading'}
        />
      </div>
    </main>
  )
}
