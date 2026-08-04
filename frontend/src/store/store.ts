import { configureStore } from '@reduxjs/toolkit'

import { authReducer } from '../features/auth/store/auth.slice'
import { cartReducer } from '../features/cart'
import { productsReducer } from '../features/products'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    products: productsReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
