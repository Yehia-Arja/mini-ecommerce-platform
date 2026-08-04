import { createAsyncThunk } from '@reduxjs/toolkit'

import {
  addWishlistItem,
  fetchWishlist,
  removeWishlistItem,
} from '../services/wishlist.service'
import type { Wishlist } from '../types/wishlist.types'

export const fetchWishlistThunk = createAsyncThunk<
  Wishlist,
  void,
  { rejectValue: string }
>('wishlist/fetch', async (_, { rejectWithValue }) => {
  const response = await fetchWishlist()

  if ('error' in response) {
    return rejectWithValue(response.message)
  }

  return response.data
})

export const addWishlistItemThunk = createAsyncThunk<
  Wishlist,
  string,
  { rejectValue: string }
>('wishlist/addItem', async (productId, { rejectWithValue }) => {
  const response = await addWishlistItem(productId)

  if ('error' in response) {
    return rejectWithValue(response.message)
  }

  return response.data
})

export const removeWishlistItemThunk = createAsyncThunk<
  Wishlist,
  { wishlistItemId: string; productId: string },
  { rejectValue: string }
>('wishlist/removeItem', async (payload, { rejectWithValue }) => {
  const removeResponse = await removeWishlistItem(payload.wishlistItemId)

  if (
    typeof removeResponse === 'object' &&
    removeResponse !== null &&
    'error' in removeResponse
  ) {
    return rejectWithValue(removeResponse.message)
  }

  const wishlistResponse = await fetchWishlist()

  if ('error' in wishlistResponse) {
    return rejectWithValue(wishlistResponse.message)
  }

  return wishlistResponse.data
})
