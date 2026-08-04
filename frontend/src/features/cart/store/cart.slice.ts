import { createSlice } from '@reduxjs/toolkit'

import { resetAppState } from '../../../store/app.actions'
import type { CartState } from '../types/cart.types'
import {
  addCartItemThunk,
  fetchCartThunk,
  removeCartItemThunk,
  updateCartItemThunk,
} from './cart.thunks'

const initialState: CartState = {
  item: null,
  status: 'idle',
  mutationStatus: 'idle',
  activeItemId: null,
  activeVariantId: null,
  errorMessage: null,
  infoMessage: null,
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCartFeedback(state) {
      state.errorMessage = null
      state.infoMessage = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCartThunk.pending, (state) => {
        state.status = 'loading'
        state.errorMessage = null
      })
      .addCase(fetchCartThunk.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.item = action.payload
        state.errorMessage = null
      })
      .addCase(fetchCartThunk.rejected, (state, action) => {
        state.status = 'failed'
        state.errorMessage = action.payload ?? 'Unable to load the cart.'
      })
      .addCase(addCartItemThunk.pending, (state, action) => {
        state.mutationStatus = 'loading'
        state.activeItemId = null
        state.activeVariantId = action.meta.arg.productVariantId
        state.errorMessage = null
        state.infoMessage = null
      })
      .addCase(addCartItemThunk.fulfilled, (state, action) => {
        state.item = action.payload
        state.status = 'succeeded'
        state.mutationStatus = 'idle'
        state.activeVariantId = null
        state.infoMessage = 'Item added to cart successfully.'
      })
      .addCase(addCartItemThunk.rejected, (state, action) => {
        state.mutationStatus = 'idle'
        state.activeVariantId = null
        state.errorMessage = action.payload ?? 'Unable to add the item to the cart.'
      })
      .addCase(updateCartItemThunk.pending, (state, action) => {
        state.mutationStatus = 'loading'
        state.activeItemId = action.meta.arg.cartItemId
        state.activeVariantId = action.meta.arg.productVariantId ?? null
        state.errorMessage = null
        state.infoMessage = null
      })
      .addCase(updateCartItemThunk.fulfilled, (state, action) => {
        state.item = action.payload
        state.status = 'succeeded'
        state.mutationStatus = 'idle'
        state.activeItemId = null
        state.activeVariantId = null
        state.infoMessage = null
      })
      .addCase(updateCartItemThunk.rejected, (state, action) => {
        state.mutationStatus = 'idle'
        state.activeItemId = null
        state.activeVariantId = null
        state.errorMessage = action.payload ?? 'Unable to update the cart.'
      })
      .addCase(removeCartItemThunk.pending, (state, action) => {
        state.mutationStatus = 'loading'
        state.activeItemId = action.meta.arg
        state.activeVariantId = null
        state.errorMessage = null
        state.infoMessage = null
      })
      .addCase(removeCartItemThunk.fulfilled, (state, action) => {
        state.item = action.payload
        state.status = 'succeeded'
        state.mutationStatus = 'idle'
        state.activeItemId = null
        state.infoMessage = null
      })
      .addCase(removeCartItemThunk.rejected, (state, action) => {
        state.mutationStatus = 'idle'
        state.activeItemId = null
        state.errorMessage = action.payload ?? 'Unable to remove the item from the cart.'
      })
      .addCase(resetAppState, () => initialState)
  },
})

export const { clearCartFeedback } = cartSlice.actions
export const cartReducer = cartSlice.reducer
