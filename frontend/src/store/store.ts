import { configureStore } from '@reduxjs/toolkit'

import { authReducer } from '../features/auth/store/auth.slice'
import { cartReducer } from '../features/cart'
import { ordersReducer } from '../features/orders'
import { productsReducer } from '../features/products'
import { wishlistReducer } from '../features/wishlist'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    orders: ordersReducer,
    products: productsReducer,
    wishlist: wishlistReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
