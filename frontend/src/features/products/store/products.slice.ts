import { createSlice } from '@reduxjs/toolkit'

import type { ProductsState } from '../types/products.types'
import { fetchProductsThunk } from './products.thunks'

const initialState: ProductsState = {
  items: [],
  pagination: null,
  status: 'idle',
  errorMessage: null,
}

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductsThunk.pending, (state) => {
        state.status = 'loading'
        state.errorMessage = null
      })
      .addCase(fetchProductsThunk.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload.items
        state.pagination = action.payload.pagination
        state.errorMessage = null
      })
      .addCase(fetchProductsThunk.rejected, (state, action) => {
        state.status = 'failed'
        state.errorMessage = action.payload ?? 'Unable to load products.'
      })
  },
})

export const productsReducer = productsSlice.reducer
