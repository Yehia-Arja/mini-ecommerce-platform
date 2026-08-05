import { useEffect, useState } from 'react'
import { Link } from 'react-router'

import { AppSpinner } from '../../../components/ui/AppSpinner'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { addCartItemThunk, clearCartFeedback } from '../../cart'
import { formatProductPrice } from '../../products/utils/product-formatters'
import { clearWishlistFeedback } from '../store/wishlist.slice'
import { fetchWishlistThunk, removeWishlistItemThunk } from '../store/wishlist.thunks'
import type { WishlistItem } from '../types/wishlist.types'
import '../../products/pages/ProductsPage.css'
import './WishlistPage.css'

type WishlistPageState =
  | { type: 'loading' }
  | { type: 'error'; message: string }
  | { type: 'ready'; items: WishlistItem[]; totalItems: number }

function getDefaultVariantId(item: WishlistItem) {
  return (
    item.product.variants.find((variant) => variant.stockQuantity > 0)?.id ??
    item.product.variants[0]?.id ??
    null
  )
}

function getWishlistHeroLabel(totalItems: number) {
  return totalItems === 0
    ? 'A calm place to keep future favorites.'
    : `${totalItems} saved product${totalItems === 1 ? '' : 's'} waiting for your next move.`
}

function getAvailableVariantCount(items: WishlistItem[]) {
  return items.filter((item) =>
    item.product.variants.some((variant) => variant.stockQuantity > 0),
  ).length
}

function getNewestSavedDate(items: WishlistItem[]) {
  if (!items.length) {
    return 'No saved products yet'
  }

  const newestTimestamp = Math.max(
    ...items.map((item) => new Date(item.createdAt).getTime()),
  )

  return new Date(newestTimestamp).toLocaleDateString()
}

type WishlistProductCardProps = {
  item: WishlistItem
  isMutating: boolean
  selectedVariantId: string | null
  onRemove: (item: WishlistItem) => void
  onMoveToCart: (item: WishlistItem) => Promise<void>
  onVariantChange: (wishlistItemId: string, nextVariantId: string) => void
}

function WishlistProductCard({
  isMutating,
  item,
  onMoveToCart,
  onRemove,
  onVariantChange,
  selectedVariantId,
}: WishlistProductCardProps) {
  const primaryImage = item.product.images.find((image) => image.isPrimary)
  const imageUrl = primaryImage?.imageUrl ?? item.product.imageUrl
  const selectedVariant =
    item.product.variants.find((variant) => variant.id === selectedVariantId) ?? null
  const hasPurchasableVariant = item.product.variants.some(
    (variant) => variant.stockQuantity > 0,
  )

  return (
    <article className="wishlist-card">
      <div className="wishlist-card__media">
        {imageUrl ? (
          <img src={imageUrl} alt={item.product.title} />
        ) : (
          <div className="wishlist-card__placeholder">
            <span>{item.product.title.charAt(0)}</span>
          </div>
        )}
      </div>

      <div className="wishlist-card__content">
        <div className="wishlist-card__header">
          <div className="wishlist-card__title-block">
            <span className="wishlist-card__eyebrow">Saved product</span>
            <h2>{item.product.title}</h2>
            <p>{item.product.description}</p>
          </div>

          <div className="wishlist-card__price-block">
            <strong>{formatProductPrice(item.product.price)}</strong>
            <span>Saved on {new Date(item.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="wishlist-card__details">
          <div className="wishlist-card__detail">
            <span>Variants</span>
            <strong>{item.product.variants.length || 'None yet'}</strong>
          </div>
          <div className="wishlist-card__detail">
            <span>Ready to cart</span>
            <strong>{hasPurchasableVariant ? 'Yes' : 'Choose later'}</strong>
          </div>
        </div>

        <div className="wishlist-card__actions">
          {item.product.variants.length ? (
            <label className="wishlist-card__field">
              <span>Variant</span>
              <select
                value={selectedVariantId ?? ''}
                onChange={(event) => onVariantChange(item.id, event.target.value)}
                disabled={isMutating}
              >
                {item.product.variants.map((variant) => (
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
          ) : (
            <div className="wishlist-card__field wishlist-card__field--message">
              <span>Variants</span>
              <strong>Visit the product page later for options.</strong>
            </div>
          )}

          <div className="wishlist-card__button-row">
            <button
              className="wishlist-card__primary-action"
              type="button"
              onClick={() => void onMoveToCart(item)}
              disabled={!selectedVariant || selectedVariant.stockQuantity <= 0 || isMutating}
            >
              {isMutating ? 'Working...' : 'Move to cart'}
            </button>

            <button
              className="wishlist-card__secondary-action"
              type="button"
              onClick={() => onRemove(item)}
              disabled={isMutating}
            >
              Remove
            </button>

            <Link className="wishlist-card__link" to={`/products/${item.product.id}`}>
              View details
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}

export function WishlistPage() {
  const dispatch = useAppDispatch()
  const {
    activeItemId,
    activeProductId,
    errorMessage,
    infoMessage,
    item,
    mutationStatus,
    status,
  } = useAppSelector((state) => state.wishlist)
  const [selectedVariantsByItemId, setSelectedVariantsByItemId] = useState<
    Record<string, string | null>
  >({})
  const [movingItemId, setMovingItemId] = useState<string | null>(null)

  useEffect(() => {
    dispatch(clearWishlistFeedback())
    dispatch(clearCartFeedback())

    if (status === 'idle') {
      void dispatch(fetchWishlistThunk())
    }
  }, [dispatch, status])

  useEffect(() => {
    return () => {
      dispatch(clearWishlistFeedback())
      dispatch(clearCartFeedback())
    }
  }, [dispatch])

  const pageState: WishlistPageState =
    status === 'idle' || status === 'loading'
      ? { type: 'loading' }
      : status === 'failed' || !item
        ? { type: 'error', message: errorMessage ?? 'Please try again in a moment.' }
        : { type: 'ready', items: item.items, totalItems: item.totalItems }

  const stats =
    pageState.type !== 'ready'
      ? {
          availableCount: 0,
          newestSavedDate: 'No saved products yet',
        }
      : {
          availableCount: getAvailableVariantCount(pageState.items),
          newestSavedDate: getNewestSavedDate(pageState.items),
        }

  const handleVariantChange = (wishlistItemId: string, nextVariantId: string) => {
    setSelectedVariantsByItemId((currentState) => ({
      ...currentState,
      [wishlistItemId]: nextVariantId,
    }))
  }

  const handleRemove = (wishlistItem: WishlistItem) => {
    void dispatch(
      removeWishlistItemThunk({
        wishlistItemId: wishlistItem.id,
        productId: wishlistItem.product.id,
      }),
    )
  }

  const handleMoveToCart = async (wishlistItem: WishlistItem) => {
    const selectedVariantId =
      selectedVariantsByItemId[wishlistItem.id] ?? getDefaultVariantId(wishlistItem)

    if (!selectedVariantId || movingItemId === wishlistItem.id) {
      return
    }

    dispatch(clearWishlistFeedback())
    dispatch(clearCartFeedback())
    setMovingItemId(wishlistItem.id)

    const addResult = await dispatch(
      addCartItemThunk({
        productVariantId: selectedVariantId,
        quantity: 1,
      }),
    )

    if (!addCartItemThunk.fulfilled.match(addResult)) {
      setMovingItemId(null)
      return
    }

    await dispatch(
      removeWishlistItemThunk({
        wishlistItemId: wishlistItem.id,
        productId: wishlistItem.product.id,
      }),
    )

    setMovingItemId(null)
  }

  return (
    <main className="wishlist-page">
      <div className="wishlist-page__container">
        {pageState.type === 'ready' ? (
          <>
            <nav className="products-breadcrumb" aria-label="Breadcrumb">
              <Link className="products-breadcrumb__link" to="/">
                Catalog
              </Link>
              <span className="products-breadcrumb__separator">/</span>
              <span className="products-breadcrumb__current">Wishlist</span>
            </nav>

            <section className="wishlist-hero">
              <div className="wishlist-hero__copy">
                <span className="products-page__eyebrow">Wishlist</span>
                <h1>Keep your best picks in one calm, ready-to-shop list.</h1>
                <p>
                  Save products while you compare options, then move them to cart
                  whenever you are ready to choose a specific variant.
                </p>
              </div>

              <div className="wishlist-hero__stats" aria-label="Wishlist overview">
                <article className="wishlist-hero__stat">
                  <span>Saved items</span>
                  <strong>{pageState.totalItems}</strong>
                  <p>{getWishlistHeroLabel(pageState.totalItems)}</p>
                </article>
                <article className="wishlist-hero__stat">
                  <span>Ready to cart</span>
                  <strong>{stats.availableCount}</strong>
                  <p>Products with at least one in-stock variant right now.</p>
                </article>
                <article className="wishlist-hero__stat">
                  <span>Newest save</span>
                  <strong>{stats.newestSavedDate}</strong>
                  <p>Your most recent saved product date.</p>
                </article>
              </div>
            </section>

            {infoMessage ? (
              <section className="wishlist-feedback" aria-live="polite">
                <p>{infoMessage}</p>
              </section>
            ) : null}

            {pageState.items.length ? (
              <section className="wishlist-grid" aria-label="Wishlist items">
                {pageState.items.map((wishlistItem) => {
                  const isMutating =
                    movingItemId === wishlistItem.id ||
                    (mutationStatus === 'loading' &&
                      (activeItemId === wishlistItem.id ||
                        activeProductId === wishlistItem.product.id))

                  return (
                    <WishlistProductCard
                      key={wishlistItem.id}
                      item={wishlistItem}
                      isMutating={isMutating}
                      selectedVariantId={
                        wishlistItem.product.variants.some(
                          (variant) =>
                            variant.id === selectedVariantsByItemId[wishlistItem.id],
                        )
                          ? selectedVariantsByItemId[wishlistItem.id]
                          : getDefaultVariantId(wishlistItem)
                      }
                      onRemove={handleRemove}
                      onMoveToCart={handleMoveToCart}
                      onVariantChange={handleVariantChange}
                    />
                  )
                })}
              </section>
            ) : (
              <section className="products-empty" aria-live="polite">
                <span className="products-empty__badge">Wishlist</span>
                <h2>Your wishlist is empty right now.</h2>
                <p>
                  Save a few products from the catalog so you can revisit them,
                  compare variants, and move favorites to cart later.
                </p>
                <Link className="product-details__primary-action" to="/">
                  Browse products
                </Link>
              </section>
            )}
          </>
        ) : pageState.type === 'loading' ? (
          <section className="wishlist-loading-state">
            <AppSpinner label="Loading wishlist" size="md" tone="primary" />
          </section>
        ) : (
          <section className="products-status products-status--error" role="alert">
            <div>
              <h2>We could not load your wishlist.</h2>
              <p>{pageState.message}</p>
            </div>

            <button
              className="products-status__action"
              type="button"
              onClick={() => void dispatch(fetchWishlistThunk())}
            >
              Try again
            </button>
          </section>
        )}
      </div>
    </main>
  )
}
