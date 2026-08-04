import { createAsyncThunk } from '@reduxjs/toolkit'

import { fetchProducts } from '../services/products.service'
import type {
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
