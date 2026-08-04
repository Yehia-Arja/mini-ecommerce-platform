import { memo, useEffect, useMemo, useState } from 'react'
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
  type ProductVariant,
} from '../../products'
import { formatProductPrice } from '../../products/utils/product-formatters'
import type { Cart, CartItem } from '../types/cart.types'
import '../../products/pages/ProductsPage.css'
import './CartPage.css'

type CartPageState =
  | { type: 'loading' }
  | { type: 'error'; message: string }
  | { type: 'ready'; cart: Cart }

type CartItemCardProps = {
  item: CartItem
  variantOptions: ProductVariant[]
  isUpdating: boolean
  onQuantityChange: (item: CartItem, direction: 'increment' | 'decrement') => void
  onRemove: (itemId: string) => void
  onVariantChange: (itemId: string, nextVariantId: string) => void
}

function getRecommendationProducts(products: ProductListItem[], cart: Cart) {
  const cartProductIds = new Set(cart.items.map((item) => item.product.id))

  return products
    .filter((product) => !cartProductIds.has(product.id))
    .slice(0, 6)
}

function getCartHeroLabel(itemCount: number) {
  return itemCount === 0
    ? 'Your bag is ready for a fresh start.'
    : `${itemCount} line item${itemCount === 1 ? '' : 's'} ready to review.`
}

const CartItemCard = memo(function CartItemCard({
  item,
  variantOptions,
  isUpdating,
  onQuantityChange,
  onRemove,
  onVariantChange,
}: CartItemCardProps) {
  return (
    <article className="cart-item-card">
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
            onClick={() => onRemove(item.id)}
            disabled={isUpdating}
          >
            Remove
          </button>
        </div>

        <div className="cart-item-card__controls">
          <label className="cart-item-card__field">
            <span>Variant</span>
            <select
              value={item.variant.id}
              onChange={(event) => onVariantChange(item.id, event.target.value)}
              disabled={isUpdating}
            >
              {variantOptions.map((variant) => (
                <option
                  key={variant.id}
                  value={variant.id}
                  disabled={variant.stockQuantity <= 0}
                >
                  {variant.name} - {formatProductPrice(variant.price)}
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
                onClick={() => onQuantityChange(item, 'decrement')}
                disabled={isUpdating || item.quantity <= 1}
              >
                -
              </button>
              <strong>{item.quantity}</strong>
              <button
                type="button"
                aria-label={`Increase quantity for ${item.product.title}`}
                onClick={() => onQuantityChange(item, 'increment')}
                disabled={isUpdating || item.quantity >= item.variant.stockQuantity}
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
}, areCartItemCardPropsEqual)

function areCartItemCardPropsEqual(
  previousProps: CartItemCardProps,
  nextProps: CartItemCardProps,
) {
  const previousItem = previousProps.item
  const nextItem = nextProps.item

  return (
    previousProps.isUpdating === nextProps.isUpdating &&
    previousItem.id === nextItem.id &&
    previousItem.quantity === nextItem.quantity &&
    previousItem.unitPrice === nextItem.unitPrice &&
    previousItem.subtotal === nextItem.subtotal &&
    previousItem.product.title === nextItem.product.title &&
    previousItem.product.imageUrl === nextItem.product.imageUrl &&
    previousItem.variant.id === nextItem.variant.id &&
    previousItem.variant.code === nextItem.variant.code &&
    previousItem.variant.stockQuantity === nextItem.variant.stockQuantity &&
    previousProps.variantOptions === nextProps.variantOptions
  )
}

const CartRecommendations = memo(function CartRecommendations({
  catalogStatus,
  products,
}: {
  catalogStatus: string
  products: ProductListItem[]
}) {
  return (
    <section className="cart-recommendations">
      <div className="cart-section-heading">
        <div>
          <h2>Related products</h2>
          <p>More picks you might want to add before checkout.</p>
        </div>
      </div>

      {catalogStatus === 'loading' || catalogStatus === 'idle' ? (
        <div className="cart-recommendations__loading">
          <AppSpinner label="Loading related products" size="md" tone="primary" />
        </div>
      ) : (
        <ProductsCatalog products={products} />
      )}
    </section>
  )
})

export function CartPage() {
  const dispatch = useAppDispatch()
  const { items: catalogItems, status: catalogStatus } = useAppSelector(
    (state) => state.products.catalog,
  )
  const {
    activeItemId,
    errorMessage,
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

  const variantOptionsByItemId = useMemo(() => {
    return (cart?.items ?? []).reduce<Record<string, ProductVariant[]>>((accumulator, item) => {
      const product =
        catalogItems.find((entry) => entry.id === item.product.id) ??
        productDetailsById[item.product.id]

      accumulator[item.id] =
        product?.variants.length
          ? product.variants
          : [
              {
                ...item.variant,
                isActive: true,
              },
            ]

      return accumulator
    }, {})
  }, [cart?.items, catalogItems, productDetailsById])

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
    const item = cart?.items.find((entry) => entry.id === itemId)

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

  const pageState: CartPageState =
    status === 'idle' || status === 'loading'
      ? { type: 'loading' }
      : status === 'failed' || !cart
        ? { type: 'error', message: errorMessage ?? 'Please try again in a moment.' }
        : { type: 'ready', cart }

  return (
    <main className="cart-page">
      <div className="cart-page__container">
        {pageState.type === 'ready' ? (
          <>
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
                  Adjust quantities, swap options, and review your totals before you
                  place your order.
                </p>
              </div>

              <div className="cart-hero__stats" aria-label="Cart overview">
                <article className="cart-hero__stat">
                  <span>Items</span>
                  <strong>{pageState.cart.totalQuantity}</strong>
                  <p>{getCartHeroLabel(pageState.cart.items.length)}</p>
                </article>
                <article className="cart-hero__stat">
                  <span>Subtotal</span>
                  <strong>{formatProductPrice(pageState.cart.total)}</strong>
                  <p>Calculated from the current cart item subtotals.</p>
                </article>
                <article className="cart-hero__stat">
                  <span>Updated</span>
                  <strong>{new Date(pageState.cart.updatedAt).toLocaleDateString()}</strong>
                  <p>Reflects your most recent cart changes.</p>
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

            {pageState.cart.items.length ? (
              <section className="cart-layout">
                <div className="cart-items-panel">
                  <div className="cart-section-heading">
                    <div>
                      <h2>Your items</h2>
                      <p>
                        Adjust quantity, swap variants, or remove anything you no longer
                        want.
                      </p>
                    </div>
                    <span className="cart-section-heading__badge">
                      {pageState.cart.items.length} items
                    </span>
                  </div>

                  <div className="cart-items-list">
                    {pageState.cart.items.map((item) => (
                      <CartItemCard
                        key={item.id}
                        item={item}
                        variantOptions={variantOptionsByItemId[item.id] ?? []}
                        isUpdating={
                          mutationStatus === 'loading' && activeItemId === item.id
                        }
                        onQuantityChange={handleQuantityChange}
                        onRemove={handleRemoveItem}
                        onVariantChange={handleVariantChange}
                      />
                    ))}
                  </div>
                </div>

                <aside className="cart-summary-panel">
                  <div className="cart-summary-card">
                    <div className="cart-section-heading cart-section-heading--stacked">
                      <div>
                        <h2>Order summary</h2>
                        <p>A quick breakdown of what you are about to order.</p>
                      </div>
                    </div>

                    <div className="cart-summary-card__rows">
                      <div className="cart-summary-card__row">
                        <span>Subtotal</span>
                        <strong>{formatProductPrice(pageState.cart.total)}</strong>
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
                      <Link className="cart-summary-card__secondary-action" to="/wishlist">
                        Review wishlist
                      </Link>
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
                  Explore the catalog to add a few standout picks, then come back
                  here to review quantities, variants, and totals.
                </p>
                <Link className="product-details__primary-action" to="/">
                  Browse products
                </Link>
              </section>
            )}

            <CartRecommendations
              catalogStatus={catalogStatus}
              products={recommendations}
            />
          </>
        ) : pageState.type === 'loading' ? (
          <section className="cart-loading-state">
            <AppSpinner label="Loading cart" size="md" tone="primary" />
          </section>
        ) : (
          <section className="products-status products-status--error" role="alert">
            <div>
              <h2>We could not load your cart.</h2>
              <p>{pageState.message}</p>
            </div>

            <button
              className="products-status__action"
              type="button"
              onClick={() => void dispatch(fetchCartThunk())}
            >
              Try again
            </button>
          </section>
        )}
      </div>
    </main>
  )
}
