import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router'

import { LoginPage } from '../features/auth'
import { CartPage } from '../features/cart'
import { OrderConfirmationPage } from '../features/orders'
import { ProductDetailsPage } from '../features/products'
import { WishlistPage, fetchWishlistThunk } from '../features/wishlist'
import { fetchCurrentUserThunk } from '../features/auth/store/auth.thunks'
import { HomePage } from '../features/home/pages/HomePage'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { ProtectedRoute } from './ProtectedRoute'

export function AppRouter() {
  const dispatch = useAppDispatch()
  const authStatus = useAppSelector((state) => state.auth.status)
  const wishlistStatus = useAppSelector((state) => state.wishlist.status)

  useEffect(() => {
    if (authStatus === 'idle') {
      void dispatch(fetchCurrentUserThunk())
    }
  }, [authStatus, dispatch])

  useEffect(() => {
    if (authStatus === 'authenticated' && wishlistStatus === 'idle') {
      void dispatch(fetchWishlistThunk())
    }
  }, [authStatus, dispatch, wishlistStatus])

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/products/:productId"
        element={
          <ProtectedRoute>
            <ProductDetailsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cart"
        element={
          <ProtectedRoute>
            <CartPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/wishlist"
        element={
          <ProtectedRoute>
            <WishlistPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders/:orderId"
        element={
          <ProtectedRoute>
            <OrderConfirmationPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
