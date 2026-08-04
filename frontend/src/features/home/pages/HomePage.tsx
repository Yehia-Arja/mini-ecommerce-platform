import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { useNavigate } from 'react-router'

import { logoutThunk } from '../../auth'
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

function getUserInitials(firstName: string, lastName: string | null) {
  const initials = `${firstName.charAt(0)}${lastName?.charAt(0) ?? ''}`.trim()

  return initials.toUpperCase()
}

export function HomePage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { errorMessage, items, status } = useAppSelector(
    (state) => state.products.catalog,
  )
  const { currentRequestType, status: authStatus, user } = useAppSelector(
    (state) => state.auth,
  )
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)
  const accountMenuRef = useRef<HTMLDivElement | null>(null)
  const isLoading = status === 'idle' || status === 'loading'
  const isLoggingOut = currentRequestType === 'logout'
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

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      navigate('/login', { replace: true })
    }
  }, [authStatus, navigate])

  useEffect(() => {
    if (!isAccountMenuOpen) {
      return
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!accountMenuRef.current?.contains(event.target as Node)) {
        setIsAccountMenuOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsAccountMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isAccountMenuOpen])

  const handleLogout = async () => {
    const result = await dispatch(logoutThunk())

    if (!logoutThunk.fulfilled.match(result)) {
      return
    }

    setIsAccountMenuOpen(false)
  }

  return (
    <main className="home-page">
      <div className="home-page__container">
        <section className="home-hero">
          <div className="home-hero__copy">
            <div className="home-hero__topbar">
              <span className="home-hero__eyebrow">Mini Ecommerce</span>

              {user ? (
                <div className="home-account-menu" ref={accountMenuRef}>
                  <button
                    className="home-account-menu__trigger"
                    type="button"
                    aria-expanded={isAccountMenuOpen}
                    aria-haspopup="menu"
                    aria-label="Open account menu"
                    onClick={() => setIsAccountMenuOpen((current) => !current)}
                  >
                    <span className="home-account-menu__avatar">
                      {getUserInitials(user.firstName, user.lastName)}
                    </span>
                    <span className="home-account-menu__details">
                      <strong>{user.firstName}</strong>
                      <span>Account</span>
                    </span>
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        d="M7 10l5 5 5-5"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.8"
                      />
                    </svg>
                  </button>

                  {isAccountMenuOpen ? (
                    <div className="home-account-menu__panel" role="menu">
                      <div className="home-account-menu__summary">
                        <strong>{user.firstName}</strong>
                        <span>{user.email}</span>
                      </div>

                      <button
                        className="home-account-menu__action"
                        type="button"
                        role="menuitem"
                        onClick={() => void handleLogout()}
                        disabled={isLoggingOut}
                      >
                        {isLoggingOut ? 'Signing out...' : 'Log out'}
                      </button>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>

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
