import { useEffect } from 'react'
import { Link, useParams } from 'react-router'

import { AppSpinner } from '../../../components/ui/AppSpinner'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { formatProductPrice } from '../../products/utils/product-formatters'
import { clearOrdersFeedback } from '../store/orders.slice'
import { fetchOrderByIdThunk } from '../store/orders.thunks'
import type { Order } from '../types/orders.types'
import '../../products/pages/ProductsPage.css'
import './OrderConfirmationPage.css'

type OrderConfirmationState =
  | { type: 'missing-id' }
  | { type: 'loading' }
  | { type: 'error'; message: string }
  | { type: 'ready'; order: Order }

function getOrderPlacedLabel(order: Order) {
  return new Date(order.createdAt).toLocaleDateString()
}

export function OrderConfirmationPage() {
  const dispatch = useAppDispatch()
  const { orderId } = useParams<{ orderId: string }>()
  const { currentOrder, currentOrderId, errorMessage, infoMessage, placementStatus, status } =
    useAppSelector((state) => state.orders)

  useEffect(() => {
    if (!orderId) {
      return
    }

    if (currentOrderId !== orderId || !currentOrder) {
      void dispatch(fetchOrderByIdThunk(orderId))
    }
  }, [currentOrder, currentOrderId, dispatch, orderId])

  useEffect(() => {
    return () => {
      dispatch(clearOrdersFeedback())
    }
  }, [dispatch])

  const isWaitingForOrder =
    !!orderId &&
    !errorMessage &&
    (placementStatus === 'loading' ||
      status === 'loading' ||
      currentOrderId !== orderId ||
      !currentOrder)

  const viewState: OrderConfirmationState =
    !orderId
      ? { type: 'missing-id' }
      : isWaitingForOrder
        ? { type: 'loading' }
        : errorMessage || !currentOrder || currentOrderId !== orderId
          ? {
              type: 'error',
              message: errorMessage ?? 'We could not load this order right now.',
            }
          : { type: 'ready', order: currentOrder }

  return (
    <main className="order-confirmation-page">
      <div className="order-confirmation-page__container">
        {viewState.type === 'ready' ? (
          <>
            <nav className="products-breadcrumb" aria-label="Breadcrumb">
              <Link className="products-breadcrumb__link" to="/">
                Catalog
              </Link>
              <span className="products-breadcrumb__separator">/</span>
              <Link className="products-breadcrumb__link" to="/cart">
                Cart
              </Link>
              <span className="products-breadcrumb__separator">/</span>
              <span className="products-breadcrumb__current">Order confirmation</span>
            </nav>

            <section className="order-confirmation-hero">
              <div className="order-confirmation-hero__copy">
                <span className="products-page__eyebrow">Order Confirmed</span>
                <h1>Your order is confirmed.</h1>
              </div>

              <div className="order-confirmation-hero__stats" aria-label="Order overview">
                <article className="order-confirmation-hero__stat">
                  <span>Order ID</span>
                  <strong>{viewState.order.id}</strong>
                  <p>Saved as a permanent order snapshot.</p>
                </article>
                <article className="order-confirmation-hero__stat">
                  <span>Total</span>
                  <strong>{formatProductPrice(viewState.order.totalAmount)}</strong>
                  <p>{viewState.order.totalQuantity} total item(s) confirmed.</p>
                </article>
                <article className="order-confirmation-hero__stat">
                  <span>Placed</span>
                  <strong>{getOrderPlacedLabel(viewState.order)}</strong>
                  <p>Status: {viewState.order.status}</p>
                </article>
              </div>
            </section>

            {infoMessage ? (
              <section className="order-confirmation-feedback" aria-live="polite">
                <p>{infoMessage}</p>
              </section>
            ) : null}

            <section className="order-confirmation-layout">
              <div className="order-confirmation-items">
                <div className="order-confirmation-section-heading">
                  <div>
                    <h2>Order summary</h2>
                    <p>Everything captured at the moment you confirmed the checkout.</p>
                  </div>
                </div>

                <div className="order-confirmation-items__list">
                  {viewState.order.items.map((item) => (
                    <article className="order-confirmation-item-card" key={item.id}>
                      <div className="order-confirmation-item-card__copy">
                        <h3>{item.productTitle}</h3>
                        <p>
                          {item.variantName} | {item.variantCode}
                        </p>
                      </div>

                      <div className="order-confirmation-item-card__meta">
                        <div>
                          <span>Unit price</span>
                          <strong>{formatProductPrice(item.unitPrice)}</strong>
                        </div>
                        <div>
                          <span>Quantity</span>
                          <strong>{item.quantity}</strong>
                        </div>
                        <div>
                          <span>Line total</span>
                          <strong>{formatProductPrice(item.lineTotal)}</strong>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              <aside className="order-confirmation-summary">
                <div className="order-confirmation-summary__card">
                  <div className="order-confirmation-section-heading order-confirmation-section-heading--stacked">
                    <div>
                      <h2>Confirmation details</h2>
                    </div>
                  </div>

                  <div className="order-confirmation-summary__rows">
                    <div className="order-confirmation-summary__row">
                      <span>Status</span>
                      <strong>{viewState.order.status}</strong>
                    </div>
                    <div className="order-confirmation-summary__row">
                      <span>Items</span>
                      <strong>{viewState.order.totalQuantity}</strong>
                    </div>
                    <div className="order-confirmation-summary__row order-confirmation-summary__row--total">
                      <span>Total paid</span>
                      <strong>{formatProductPrice(viewState.order.totalAmount)}</strong>
                    </div>
                  </div>

                  <div className="order-confirmation-summary__actions">
                    <Link className="order-confirmation-summary__primary-action" to="/">
                      Back to catalog
                    </Link>
                  </div>
                </div>
              </aside>
            </section>
          </>
        ) : viewState.type === 'loading' ? (
          <section className="order-confirmation-loading-state">
            <AppSpinner label="Loading order confirmation" size="md" tone="primary" />
          </section>
        ) : viewState.type === 'error' ? (
          <section className="products-status products-status--error" role="alert">
            <div>
              <h2>We could not load your order.</h2>
              <p>{viewState.message}</p>
            </div>

            <div className="products-status__actions">
              <button
                className="products-status__action"
                type="button"
                onClick={() => (orderId ? void dispatch(fetchOrderByIdThunk(orderId)) : null)}
              >
                Try again
              </button>
              <Link className="products-status__link" to="/">
                Back to catalog
              </Link>
            </div>
          </section>
        ) : (
          <section className="products-status products-status--error" role="alert">
            <div>
              <h2>We could not identify this order.</h2>
              <p>The confirmation link is incomplete.</p>
            </div>

            <Link className="products-status__link" to="/">
              Back to catalog
            </Link>
          </section>
        )}
      </div>
    </main>
  )
}
