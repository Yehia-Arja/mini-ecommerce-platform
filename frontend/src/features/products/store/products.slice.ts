import { createSlice } from '@reduxjs/toolkit'

import { resetAppState } from '../../../store/app.actions'
import type { ProductsState } from '../types/products.types'
import { fetchProductByIdThunk, fetchProductsThunk } from './products.thunks'

const initialState: ProductsState = {
  catalog: {
    items: [],
    pagination: null,
    status: 'idle',
    errorMessage: null,
  },
  selectedProduct: {
    currentProductId: null,
    currentRequestId: null,
    item: null,
    status: 'idle',
    errorMessage: null,
  },
}

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearSelectedProduct(state) {
      state.selectedProduct = {
        currentProductId: null,
        currentRequestId: null,
        item: null,
        status: 'idle',
        errorMessage: null,
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductsThunk.pending, (state) => {
        state.catalog.status = 'loading'
        state.catalog.errorMessage = null
      })
      .addCase(fetchProductsThunk.fulfilled, (state, action) => {
        state.catalog.status = 'succeeded'
        state.catalog.items = action.payload.items
        state.catalog.pagination = action.payload.pagination
        state.catalog.errorMessage = null
      })
      .addCase(fetchProductsThunk.rejected, (state, action) => {
        state.catalog.status = 'failed'
        state.catalog.errorMessage = action.payload ?? 'Unable to load products.'
      })
      .addCase(fetchProductByIdThunk.pending, (state, action) => {
        state.selectedProduct.currentProductId = action.meta.arg
        state.selectedProduct.currentRequestId = action.meta.requestId
        state.selectedProduct.status = 'loading'
        state.selectedProduct.errorMessage = null
      })
      .addCase(fetchProductByIdThunk.fulfilled, (state, action) => {
        if (state.selectedProduct.currentRequestId !== action.meta.requestId) {
          return
        }

        state.selectedProduct.status = 'succeeded'
        state.selectedProduct.currentProductId = action.meta.arg
        state.selectedProduct.currentRequestId = null
        state.selectedProduct.item = action.payload
        state.selectedProduct.errorMessage = null
      })
      .addCase(fetchProductByIdThunk.rejected, (state, action) => {
        if (state.selectedProduct.currentRequestId !== action.meta.requestId) {
          return
        }

        state.selectedProduct.status = 'failed'
        state.selectedProduct.currentProductId = action.meta.arg
        state.selectedProduct.currentRequestId = null
        state.selectedProduct.item = null
        state.selectedProduct.errorMessage =
          action.payload ?? 'Unable to load the product.'
      })
      .addCase(resetAppState, () => initialState)
  },
})

export const { clearSelectedProduct } = productsSlice.actions
export const productsReducer = productsSlice.reducer
