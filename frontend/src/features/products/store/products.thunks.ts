import { createAsyncThunk } from '@reduxjs/toolkit'

import { fetchProductById, fetchProducts } from '../services/products.service'
import type {
  ProductListItem,
  ProductsListParams,
  ProductsListResponse,
} from '../types/products.types'

export const fetchProductsThunk = createAsyncThunk<
  ProductsListResponse,
  ProductsListParams | undefined,
  { rejectValue: string }
>('products/list', async (params, { rejectWithValue }) => {
  const response = await fetchProducts(params)

  if ('error' in response) {
    return rejectWithValue(response.message)
  }

  return response.data
})

export const fetchProductByIdThunk = createAsyncThunk<
  ProductListItem,
  string,
  { rejectValue: string }
>('products/details', async (productId, { rejectWithValue }) => {
  const response = await fetchProductById(productId)

  if ('error' in response) {
    return rejectWithValue(response.message)
  }

  return response.data
})
