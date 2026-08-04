import { createAsyncThunk } from '@reduxjs/toolkit'

import {
  addCartItem,
  fetchCart,
  removeCartItem,
  updateCartItem,
} from '../services/cart.service'
import type { Cart } from '../types/cart.types'

export const fetchCartThunk = createAsyncThunk<Cart, void, { rejectValue: string }>(
  'cart/fetch',
  async (_, { rejectWithValue }) => {
    const response = await fetchCart()

    if ('error' in response) {
      return rejectWithValue(response.message)
    }

    return response.data
  },
)

export const addCartItemThunk = createAsyncThunk<
  Cart,
  { productVariantId: string; quantity: number },
  { rejectValue: string }
>('cart/addItem', async (payload, { rejectWithValue }) => {
  const response = await addCartItem(payload)

  if ('error' in response) {
    return rejectWithValue(response.message)
  }

  return response.data
})

export const updateCartItemThunk = createAsyncThunk<
  Cart,
  {
    cartItemId: string
    quantity?: number
    productVariantId?: string
  },
  { rejectValue: string }
>('cart/updateItem', async (payload, { rejectWithValue }) => {
  const response = await updateCartItem(payload)

  if ('error' in response) {
    return rejectWithValue(response.message)
  }

  return response.data
})

export const removeCartItemThunk = createAsyncThunk<
  Cart,
  string,
  { rejectValue: string }
>('cart/removeItem', async (cartItemId, { rejectWithValue }) => {
  const removeResponse = await removeCartItem(cartItemId)

  if (typeof removeResponse === 'object' && removeResponse !== null && 'error' in removeResponse) {
    return rejectWithValue(removeResponse.message)
  }

  const cartResponse = await fetchCart()

  if ('error' in cartResponse) {
    return rejectWithValue(cartResponse.message)
  }

  return cartResponse.data
})
