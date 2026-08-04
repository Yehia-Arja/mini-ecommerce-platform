import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { addWishlistItemThunk, removeWishlistItemThunk } from '../store/wishlist.thunks'

type WishlistToggleButtonProps = {
  productId: string
  productTitle: string
  className?: string
}

export function WishlistToggleButton({
  className = '',
  productId,
  productTitle,
}: WishlistToggleButtonProps) {
  const dispatch = useAppDispatch()
  const { activeItemId, activeProductId, item, mutationStatus } = useAppSelector(
    (state) => state.wishlist,
  )
  const wishlistItem =
    item?.items.find((entry) => entry.product.id === productId) ?? null
  const isSaved = Boolean(wishlistItem)
  const isBusy =
    mutationStatus === 'loading' &&
    (activeProductId === productId || activeItemId === wishlistItem?.id)

  const handleClick = () => {
    if (wishlistItem) {
      void dispatch(
        removeWishlistItemThunk({
          wishlistItemId: wishlistItem.id,
          productId,
        }),
      )
      return
    }

    void dispatch(addWishlistItemThunk(productId))
  }

  return (
    <button
      className={`${className} wishlist-toggle-button${
        isSaved ? ' wishlist-toggle-button--saved' : ''
      }`.trim()}
      type="button"
      onClick={handleClick}
      disabled={isBusy}
      aria-label={isSaved ? `Remove ${productTitle} from wishlist` : `Save ${productTitle} to wishlist`}
    >
      {isBusy ? (isSaved ? 'Removing...' : 'Saving...') : isSaved ? 'Saved' : 'Save'}
    </button>
  )
}
