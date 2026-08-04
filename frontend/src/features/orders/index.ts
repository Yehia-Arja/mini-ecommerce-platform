export { OrderConfirmationPage } from './pages/OrderConfirmationPage'
export { clearOrdersFeedback, ordersReducer } from './store/orders.slice'
export { fetchOrderByIdThunk, placeOrderThunk } from './store/orders.thunks'
export type {
  Order,
  OrderItem,
  OrdersState,
  OrdersStatus,
  OrderSuccessResponse,
} from './types/orders.types'
