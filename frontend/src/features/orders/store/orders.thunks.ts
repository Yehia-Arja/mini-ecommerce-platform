import { createAsyncThunk } from '@reduxjs/toolkit'

import { fetchOrderById, placeOrder } from '../services/orders.service'
import type { Order } from '../types/orders.types'

export const placeOrderThunk = createAsyncThunk<
  Order,
  void,
  { rejectValue: string }
>('orders/place', async (_, { rejectWithValue }) => {
  const response = await placeOrder()

  if ('error' in response) {
    return rejectWithValue(response.message)
  }

  return response.data
})

export const fetchOrderByIdThunk = createAsyncThunk<
  Order,
  string,
  { rejectValue: string }
>('orders/details', async (orderId, { rejectWithValue }) => {
  const response = await fetchOrderById(orderId)

  if ('error' in response) {
    return rejectWithValue(response.message)
  }

  return response.data
})
