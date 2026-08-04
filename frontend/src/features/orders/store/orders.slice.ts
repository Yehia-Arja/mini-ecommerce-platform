import { createSlice } from '@reduxjs/toolkit'

import { resetAppState } from '../../../store/app.actions'
import type { OrdersState } from '../types/orders.types'
import { fetchOrderByIdThunk, placeOrderThunk } from './orders.thunks'

const initialState: OrdersState = {
  currentOrder: null,
  currentOrderId: null,
  currentFetchRequestId: null,
  currentPlacementRequestId: null,
  status: 'idle',
  placementStatus: 'idle',
  errorMessage: null,
  infoMessage: null,
}

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearOrdersFeedback(state) {
      state.errorMessage = null
      state.infoMessage = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(placeOrderThunk.pending, (state, action) => {
        state.placementStatus = 'loading'
        state.currentPlacementRequestId = action.meta.requestId
        state.errorMessage = null
        state.infoMessage = null
      })
      .addCase(placeOrderThunk.fulfilled, (state, action) => {
        if (state.currentPlacementRequestId !== action.meta.requestId) {
          return
        }

        state.currentOrder = action.payload
        state.currentOrderId = action.payload.id
        state.currentPlacementRequestId = null
        state.status = 'succeeded'
        state.placementStatus = 'idle'
        state.errorMessage = null
        state.infoMessage = 'Order placed successfully.'
      })
      .addCase(placeOrderThunk.rejected, (state, action) => {
        if (state.currentPlacementRequestId !== action.meta.requestId) {
          return
        }

        state.currentPlacementRequestId = null
        state.placementStatus = 'idle'
        state.errorMessage = action.payload ?? 'Unable to place the order.'
      })
      .addCase(fetchOrderByIdThunk.pending, (state, action) => {
        state.status = 'loading'
        state.currentOrderId = action.meta.arg
        state.currentFetchRequestId = action.meta.requestId
        state.errorMessage = null
      })
      .addCase(fetchOrderByIdThunk.fulfilled, (state, action) => {
        if (state.currentFetchRequestId !== action.meta.requestId) {
          return
        }

        state.status = 'succeeded'
        state.currentOrder = action.payload
        state.currentOrderId = action.payload.id
        state.currentFetchRequestId = null
        state.errorMessage = null
      })
      .addCase(fetchOrderByIdThunk.rejected, (state, action) => {
        if (state.currentFetchRequestId !== action.meta.requestId) {
          return
        }

        state.status = 'failed'
        state.currentOrder = null
        state.currentFetchRequestId = null
        state.errorMessage = action.payload ?? 'Unable to load the order.'
      })
      .addCase(resetAppState, () => initialState)
  },
})

export const { clearOrdersFeedback } = ordersSlice.actions
export const ordersReducer = ordersSlice.reducer
