import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'

import { AppSpinner } from '../../../components/ui/AppSpinner'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import {
  clearCartFeedback,
  fetchCartThunk,
  removeCartItemThunk,
  updateCartItemThunk,
} from '..'
import {
  fetchProductById,
  fetchProductsThunk,
  ProductsCatalog,
  type ProductListItem,
} from '../../products'
import { formatProductPrice } from '../../products/utils/product-formatters'
import type { Cart, CartItem } from '../types/cart.types'
import '../../products/pages/ProductsPage.css'
import './CartPage.css'

function getRecommendationProducts(products: ProductListItem[], cart: Cart) {
  const cartProductIds = new Set(cart.items.map((item) => item.product.id))

  return products
    .filter((product) => !cartProductIds.has(product.id))
    .slice(0, 6)
}

function getCartHeroLabel(itemCount: number) {
  if (itemCount === 0) {
    return 'Your bag is ready for a fresh start.'
  }

  return `${itemCount} line item${itemCount === 1 ? '' : 's'} ready to review.`
}

export function CartPage() {
  const dispatch = useAppDispatch()
  const { items: catalogItems, status: catalogStatus } = useAppSelector(
    (state) => state.products.catalog,
  )
  const {
    activeItemId,
    errorMessage,
    infoMessage,
    item: cart,
    mutationStatus,
    status,
  } = useAppSelector((state) => state.cart)
  const [productDetailsById, setProductDetailsById] = useState<
    Record<string, ProductListItem>
  >({})

  useEffect(() => {
    if (catalogStatus === 'idle') {
      void dispatch(
        fetchProductsThunk({
          page: 1,
          pageSize: 15,
        }),
      )
    }
  }, [catalogStatus, dispatch])

  useEffect(() => {
    if (status === 'idle') {
      void dispatch(fetchCartThunk())
    }
  }, [dispatch, status])

  useEffect(() => {
    if (!cart?.items.length) {
      return
    }

    const cartProductIds = [...new Set(cart.items.map((item) => item.product.id))]
    const missingProductIds = cartProductIds.filter(
      (productId) =>
        !catalogItems.some((product) => product.id === productId) &&
        !productDetailsById[productId],
    )

    if (!missingProductIds.length) {
      return
    }

    let isCancelled = false

    void Promise.all(
      missingProductIds.map(async (productId) => {
        const response = await fetchProductById(productId)
        return { productId, response }
      }),
    ).then((results) => {
      if (isCancelled) {
        return
      }

      setProductDetailsById((currentState) => {
        const nextState = { ...currentState }

        for (const { productId, response } of results) {
          if ('error' in response) {
            continue
          }

          nextState[productId] = response.data
        }

        return nextState
      })
    })

    return () => {
      isCancelled = true
    }
  }, [cart?.items, catalogItems, productDetailsById])

  useEffect(() => {
    return () => {
      dispatch(clearCartFeedback())
    }
  }, [dispatch])

  const recommendations = useMemo(
    () => (cart ? getRecommendationProducts(catalogItems, cart) : []),
    [catalogItems, cart],
  )

  const estimatedShipping = cart?.items.length ? 12 : 0
  const estimatedTax = (cart?.total ?? 0) * 0.08
  const grandTotal = (cart?.total ?? 0) + estimatedShipping + estimatedTax

  const handleQuantityChange = (
    item: CartItem,
    direction: 'increment' | 'decrement',
  ) => {
    const nextQuantity =
      direction === 'increment' ? item.quantity + 1 : item.quantity - 1

    if (nextQuantity < 1 || nextQuantity > item.variant.stockQuantity) {
      return
    }

    void dispatch(
      updateCartItemThunk({
        cartItemId: item.id,
        quantity: nextQuantity,
      }),
    )
  }

  const handleRemoveItem = (itemId: string) => {
    void dispatch(removeCartItemThunk(itemId))
  }

  const handleVariantChange = (itemId: string, nextVariantId: string) => {
    if (!cart) {
      return
    }

    const item = cart.items.find((entry) => entry.id === itemId)

    if (!item) {
      return
    }

    const product =
      catalogItems.find((entry) => entry.id === item.product.id) ??
      productDetailsById[item.product.id]
    const selectedVariant = product?.variants.find((variant) => variant.id === nextVariantId)

    const safeQuantity = selectedVariant
      ? Math.min(item.quantity, Math.max(selectedVariant.stockQuantity, 1))
      : item.quantity

    void dispatch(
      updateCartItemThunk({
        cartItemId: itemId,
        productVariantId: nextVariantId,
        quantity: safeQuantity,
      }),
    )
  }

  if (status === 'idle' || status === 'loading') {
    return (
      <main className="cart-page">
        <div className="cart-page__container">
          <section className="cart-loading-state">
            <AppSpinner label="Loading cart" size="md" tone="primary" />
          </section>
        </div>
      </main>
    )
  }

  if (status === 'failed' || !cart) {
    return (
      <main className="cart-page">
        <div className="cart-page__container">
          <section className="products-status products-status--error" role="alert">
            <div>
              <h2>We could not load your cart.</h2>
              <p>{errorMessage ?? 'Please try again in a moment.'}</p>
            </div>

            <button
              className="products-status__action"
              type="button"
              onClick={() => void dispatch(fetchCartThunk())}
            >
              Try again
            </button>
          </section>
        </div>
      </main>
    )
  }

  return (
    <main className="cart-page">
      <div className="cart-page__container">
        <nav className="products-breadcrumb" aria-label="Breadcrumb">
          <Link className="products-breadcrumb__link" to="/">
            Catalog
          </Link>
          <span className="products-breadcrumb__separator">/</span>
          <span className="products-breadcrumb__current">Cart</span>
        </nav>

        <section className="cart-hero">
          <div className="cart-hero__copy">
            <span className="products-page__eyebrow">Cart</span>
            <h1>Review your picks before checkout.</h1>
            <p>
              Adjust quantities, swap variants, and review your totals using the
              live backend cart response.
            </p>
          </div>

          <div className="cart-hero__stats" aria-label="Cart overview">
            <article className="cart-hero__stat">
              <span>Items</span>
              <strong>{cart.totalQuantity}</strong>
              <p>{getCartHeroLabel(cart.items.length)}</p>
            </article>
            <article className="cart-hero__stat">
              <span>Subtotal</span>
              <strong>{formatProductPrice(cart.total)}</strong>
              <p>Calculated from the current cart item subtotals.</p>
            </article>
            <article className="cart-hero__stat">
              <span>Updated</span>
              <strong>{new Date(cart.updatedAt).toLocaleDateString()}</strong>
              <p>Reflects the most recent backend cart update.</p>
            </article>
          </div>
        </section>

        {errorMessage ? (
          <section className="products-status products-status--error" role="alert">
            <div>
              <h2>We hit a cart issue.</h2>
              <p>{errorMessage}</p>
            </div>
          </section>
        ) : null}

        {infoMessage ? (
          <section className="cart-feedback cart-feedback--success" aria-live="polite">
            <h2>Cart updated</h2>
            <p>{infoMessage}</p>
          </section>
        ) : null}

        {cart.items.length ? (
          <section className="cart-layout">
            <div className="cart-items-panel">
              <div className="cart-section-heading">
                <div>
                  <h2>Your items</h2>
                  <p>Adjust quantity, swap variants, or remove anything you no longer want.</p>
                </div>
                <span className="cart-section-heading__badge">{cart.items.length} items</span>
              </div>

              <div className="cart-items-list">
                {cart.items.map((item) => {
                  const product =
                    catalogItems.find((entry) => entry.id === item.product.id) ??
                    productDetailsById[item.product.id]
                  const variantOptions =
                    product?.variants.length
                      ? product.variants
                      : [
                          {
                            ...item.variant,
                            isActive: true,
                          },
                        ]
                  const isUpdatingItem =
                    mutationStatus === 'loading' && activeItemId === item.id

                  return (
                    <article className="cart-item-card" key={item.id}>
                      <div className="cart-item-card__media">
                        {item.product.imageUrl ? (
                          <img src={item.product.imageUrl} alt={item.product.title} />
                        ) : (
                          <div className="cart-item-card__placeholder">
                            <span>{item.product.title.charAt(0)}</span>
                          </div>
                        )}
                      </div>

                      <div className="cart-item-card__content">
                        <div className="cart-item-card__header">
                          <div>
                            <h3>{item.product.title}</h3>
                            <p>{item.variant.code}</p>
                          </div>

                          <button
                            className="cart-item-card__remove"
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={isUpdatingItem}
                          >
                            Remove
                          </button>
                        </div>

                        <div className="cart-item-card__controls">
                          <label className="cart-item-card__field">
                            <span>Variant</span>
                            <select
                              value={item.variant.id}
                              onChange={(event) =>
                                handleVariantChange(item.id, event.target.value)
                              }
                              disabled={isUpdatingItem}
                            >
                              {variantOptions.map((variant) => (
                                <option
                                  key={variant.id}
                                  value={variant.id}
                                  disabled={variant.stockQuantity <= 0}
                                >
                                  {variant.name} · {formatProductPrice(variant.price)}
                                </option>
                              ))}
                            </select>
                          </label>

                          <div className="cart-item-card__field">
                            <span>Quantity</span>
                            <div className="cart-quantity-stepper">
                              <button
                                type="button"
                                aria-label={`Decrease quantity for ${item.product.title}`}
                                onClick={() => handleQuantityChange(item, 'decrement')}
                                disabled={isUpdatingItem || item.quantity <= 1}
                              >
                                -
                              </button>
                              <strong>{item.quantity}</strong>
                              <button
                                type="button"
                                aria-label={`Increase quantity for ${item.product.title}`}
                                onClick={() => handleQuantityChange(item, 'increment')}
                                disabled={
                                  isUpdatingItem ||
                                  item.quantity >= item.variant.stockQuantity
                                }
                              >
                                +
                              </button>
                            </div>
                          </div>

                          <div className="cart-item-card__field cart-item-card__field--meta">
                            <span>In stock</span>
                            <strong>{item.variant.stockQuantity} available</strong>
                          </div>
                        </div>

                        <div className="cart-item-card__footer">
                          <div>
                            <span>Unit price</span>
                            <strong>{formatProductPrice(item.unitPrice)}</strong>
                          </div>
                          <div>
                            <span>Subtotal</span>
                            <strong>{formatProductPrice(item.subtotal)}</strong>
                          </div>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            </div>

            <aside className="cart-summary-panel">
              <div className="cart-summary-card">
                <div className="cart-section-heading cart-section-heading--stacked">
                  <div>
                    <h2>Order summary</h2>
                    <p>Based on the current backend cart totals.</p>
                  </div>
                </div>

                <div className="cart-summary-card__rows">
                  <div className="cart-summary-card__row">
                    <span>Subtotal</span>
                    <strong>{formatProductPrice(cart.total)}</strong>
                  </div>
                  <div className="cart-summary-card__row">
                    <span>Estimated shipping</span>
                    <strong>{formatProductPrice(estimatedShipping)}</strong>
                  </div>
                  <div className="cart-summary-card__row">
                    <span>Estimated tax</span>
                    <strong>{formatProductPrice(estimatedTax)}</strong>
                  </div>
                  <div className="cart-summary-card__row cart-summary-card__row--total">
                    <span>Total</span>
                    <strong>{formatProductPrice(grandTotal)}</strong>
                  </div>
                </div>

                <div className="cart-summary-card__actions">
                  <button className="cart-summary-card__primary-action" type="button">
                    Continue to checkout
                  </button>
                  <Link className="cart-summary-card__secondary-action" to="/">
                    Keep shopping
                  </Link>
                </div>
              </div>
            </aside>
          </section>
        ) : (
          <section className="products-empty" aria-live="polite">
            <span className="products-empty__badge">Cart</span>
            <h2>Your cart is empty right now.</h2>
            <p>
              Explore the catalog to add a few standout picks, then come back here
              to review quantities, variants, and totals.
            </p>
            <Link className="product-details__primary-action" to="/">
              Browse products
            </Link>
          </section>
        )}

        <section className="cart-recommendations">
          <div className="cart-section-heading">
            <div>
              <h2>Related products</h2>
              <p>Suggestions pulled from the existing catalog feature.</p>
            </div>
          </div>

          {catalogStatus === 'loading' || catalogStatus === 'idle' ? (
            <div className="cart-recommendations__loading">
              <AppSpinner label="Loading related products" size="md" tone="primary" />
            </div>
          ) : (
            <ProductsCatalog products={recommendations} />
          )}
        </section>
      </div>
    </main>
  )
}
