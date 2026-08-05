# Frontend Architecture

## Overview

The frontend is implemented with React, TypeScript, and Vite. It is organized around feature modules, React Router for navigation, Redux Toolkit for shared server-backed state, and Axios for API communication.

The current frontend features are:

- authentication
- product catalog and product details
- cart
- wishlist
- order confirmation
- home page presentation

## Feature-Based Structure

Frontend code is grouped by domain under `frontend/src/features`. Each feature owns the files it needs, such as:

- pages
- components
- services
- store logic
- types
- schemas where needed

This structure is currently used for:

- `auth`
- `products`
- `cart`
- `wishlist`
- `orders`
- `home`

Shared concerns such as routing, global store setup, spinners, and toast notifications live outside the feature folders.

## Routing And Protected Pages

React Router defines the application routes in `frontend/src/router/AppRouter.tsx`.

The current routes are:

- `/login`
- `/`
- `/products/:productId`
- `/cart`
- `/wishlist`
- `/orders/:orderId`

All routes except `/login` are wrapped in `ProtectedRoute`.

`ProtectedRoute` waits for the initial session check before rendering. While authentication is still being resolved, it shows a loading spinner. If no authenticated user is available, it redirects the user to the login page.

Using React Router keeps navigation declarative and avoids maintaining custom browser-history synchronization.

## State Management

Redux Toolkit manages server-backed state shared across routes, including:

- authentication
- products
- cart contents
- wishlist entries
- order state

The store is configured in `frontend/src/store/store.ts` with these reducers:

- `auth`
- `products`
- `cart`
- `wishlist`
- `orders`

Async thunks are used for server-backed workflows such as:

- session bootstrap and login/logout
- fetching catalog and product details
- fetching and mutating cart items
- fetching and mutating wishlist entries
- placing an order and fetching order details

Local component state is used for temporary UI values such as:

- selected product image
- selected variant
- quantity selection
- account-menu visibility

This avoids placing every interaction in the global store while keeping cross-page state centralized.

## API Communication

API communication is centralized through `frontend/src/utils/remote/axios.ts`.

The current request behavior includes:

- base URL configuration through `VITE_API_URL` with a localhost fallback
- `withCredentials = true` so cookie-based authentication works across requests
- default JSON content type
- standardized request helpers returning either response data or a normalized error object
- toast-based error feedback through the shared toast service

Feature services call this shared request utility instead of calling Axios directly from components.

## Authentication Lifecycle

The frontend performs authentication bootstrap when the app router mounts.

The current flow is:

1. if auth state is `idle`, dispatch `fetchCurrentUserThunk()`
2. while that request is in progress, protected routes show a loading screen
3. if a user is returned, auth state becomes `authenticated`
4. if auth fails, protected routes redirect to `/login`
5. once authenticated, the app also loads the wishlist when its state is still `idle`

There is also global unauthorized handling in the request layer. When an API request returns `401` and unauthorized handling is enabled:

- the app dispatches `resetAppState()`
- the user is redirected to the login page unless already on it

That keeps session-expiry behavior consistent across features instead of requiring each page to handle it separately.

## UI Composition

The app is built from page-level containers and feature components.

Examples currently implemented include:

- `HomePage`
- `ProductDetailsPage`
- `CartPage`
- `WishlistPage`
- `OrderConfirmationPage`
- `LoginPage`

Shared UI helpers currently include:

- `AppSpinner`
- toast notifications through `ToastProvider`
- `WishlistToggleButton`

Pages own data loading and route-level state decisions, while smaller components focus on rendering product cards, controls, and reusable actions.

## Loading And Error Handling

The frontend has explicit loading, empty, and error states across the main user flows.

Current patterns in the code include:

- session-check loading in `ProtectedRoute`
- product-grid skeleton cards while catalog data is loading
- empty catalog messaging when no products are available
- retry actions when catalog or product details fail to load
- inline cart success feedback in the product details page
- slice-level async feedback such as `errorMessage`, and where implemented, `infoMessage`

This keeps async behavior visible in the UI instead of assuming every request succeeds immediately.

## Styling And Responsiveness

Styling is implemented with CSS files scoped by area rather than a component library.

Current styling characteristics include:

- shared design tokens in `frontend/src/styles/theme.css`
- page-level styles such as `HomePage.css` and `ProductsPage.css`
- responsive layout adjustments through CSS media queries
- separate mobile breakpoints for grid layout, hero layout, detail panels, and action groups
- consistent visual primitives such as rounded cards, gradients, and border-based surfaces

The implemented styles are responsive across desktop and smaller viewports. For example:

- the home hero collapses from two columns to one column on smaller screens
- product grids move from three columns to two columns to one column depending on width
- detail panels and summary sections stack vertically on narrow screens

## Trade-Offs

- Redux Toolkit adds structure and boilerplate, but it keeps cross-route server-backed state predictable.
- The request helper centralizes error and unauthorized handling, but it also means request behavior is shared globally rather than customized per page by default.
- Styling is consistent and responsive, but it is still custom CSS rather than a reusable design system.
