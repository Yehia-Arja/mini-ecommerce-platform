import { createSlice } from '@reduxjs/toolkit'

import { resetAppState } from '../../../store/app.actions'
import type { WishlistState } from '../types/wishlist.types'
import {
  addWishlistItemThunk,
  fetchWishlistThunk,
  removeWishlistItemThunk,
} from './wishlist.thunks'

const initialState: WishlistState = {
  item: null,
  status: 'idle',
  currentFetchRequestId: null,
  mutationStatus: 'idle',
  activeItemId: null,
  activeProductId: null,
  errorMessage: null,
  infoMessage: null,
}

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    clearWishlistFeedback(state) {
      state.errorMessage = null
      state.infoMessage = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlistThunk.pending, (state, action) => {
        state.status = 'loading'
        state.currentFetchRequestId = action.meta.requestId
        state.errorMessage = null
      })
      .addCase(fetchWishlistThunk.fulfilled, (state, action) => {
        if (state.currentFetchRequestId !== action.meta.requestId) {
          return
        }

        state.status = 'succeeded'
        state.currentFetchRequestId = null
        state.item = action.payload
        state.errorMessage = null
      })
      .addCase(fetchWishlistThunk.rejected, (state, action) => {
        if (state.currentFetchRequestId !== action.meta.requestId) {
          return
        }

        state.status = 'failed'
        state.currentFetchRequestId = null
        state.errorMessage = action.payload ?? 'Unable to load the wishlist.'
      })
      .addCase(addWishlistItemThunk.pending, (state, action) => {
        state.mutationStatus = 'loading'
        state.currentFetchRequestId = null
        state.activeProductId = action.meta.arg
        state.activeItemId = null
        state.errorMessage = null
        state.infoMessage = null
      })
      .addCase(addWishlistItemThunk.fulfilled, (state, action) => {
        state.item = action.payload
        state.status = 'succeeded'
        state.currentFetchRequestId = null
        state.mutationStatus = 'idle'
        state.activeProductId = null
        state.infoMessage = 'Item saved to wishlist.'
      })
      .addCase(addWishlistItemThunk.rejected, (state, action) => {
        state.currentFetchRequestId = null
        state.mutationStatus = 'idle'
        state.activeProductId = null
        state.errorMessage = action.payload ?? 'Unable to save this item right now.'
      })
      .addCase(removeWishlistItemThunk.pending, (state, action) => {
        state.mutationStatus = 'loading'
        state.currentFetchRequestId = null
        state.activeItemId = action.meta.arg.wishlistItemId
        state.activeProductId = action.meta.arg.productId
        state.errorMessage = null
        state.infoMessage = null
      })
      .addCase(removeWishlistItemThunk.fulfilled, (state, action) => {
        state.item = action.payload
        state.status = 'succeeded'
        state.currentFetchRequestId = null
        state.mutationStatus = 'idle'
        state.activeItemId = null
        state.activeProductId = null
        state.infoMessage = 'Item removed from wishlist.'
      })
      .addCase(removeWishlistItemThunk.rejected, (state, action) => {
        state.currentFetchRequestId = null
        state.mutationStatus = 'idle'
        state.activeItemId = null
        state.activeProductId = null
        state.errorMessage = action.payload ?? 'Unable to remove this item right now.'
      })
      .addCase(resetAppState, () => initialState)
  },
})

export const { clearWishlistFeedback } = wishlistSlice.actions
export const wishlistReducer = wishlistSlice.reducer
