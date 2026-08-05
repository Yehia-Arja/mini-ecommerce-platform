# Architecture

## Overview

This project is a centralized full-stack mini e-commerce application built with a React frontend, an Express backend, and a PostgreSQL database. The application uses feature-based modules and a layered backend to separate HTTP handling, business rules, and database access.

At a high level:

- the frontend handles routing, UI state, and API communication
- the backend handles authentication, business rules, and persistence
- PostgreSQL stores the application's source of truth for users, sessions, products, carts, wishlists, and orders

## Repository And Version-Control Strategy

The frontend and backend are maintained in one GitHub monorepo:

```text
mini-ecommerce-platform/
├── backend/
├── frontend/
├── Dockerfile
├── docker-compose.yml
└── package.json
```

I selected a monorepo because the frontend, backend, database migrations, and container configuration belong to one application and are expected to evolve together. A single repository allows related API and frontend changes to be reviewed in one pull request and keeps setup, testing, and versioning centralized.

Separate repositories would provide more deployment independence, but that overhead is unnecessary for the operational scale of this assessment.

Development was organized through short-lived feature branches such as `auth`, `products`, `cart`, `wishlist`, and `orders`. Features were merged into `main` through pull requests after their implementation and verification. Commits were kept focused on individual features, fixes, or refactoring work.

## Feature Modules

The system is organized around the following business domains:

- `auth`
- `products`
- `cart`
- `wishlist`
- `orders`

This feature-based structure is used in both the backend and frontend. Each domain owns its own routes or pages, services, validation, types, and tests instead of spreading related logic across generic folders.

On the frontend, Redux Toolkit slices manage shared application state for:

- authentication
- product catalog data
- cart state
- wishlist state
- order state

On the backend, the same feature boundaries are mirrored through routers, controllers, services, repositories, and tests.

## Authentication

I used opaque database-backed sessions because this is a centralized application and immediate session revocation is useful. The trade-off is that authenticated requests require a database lookup. JWTs could reduce those lookups, but would require a different revocation strategy that is unnecessary for this assessment.

In practice:

- the backend generates opaque session IDs
- session records are stored in the `sessions` table
- the browser receives an access cookie and a refresh cookie
- protected endpoints resolve the current user from the access cookie

The cookie strategy implemented in the app is:

- `HttpOnly` cookies
- `SameSite=Lax`
- an access cookie scoped to `/`
- a refresh cookie scoped to `/api/auth`
- environment-controlled `Secure` behavior

## System Data Model

The core schema currently includes:

- `user_types`
- `users`
- `sessions`
- `products`
- `product_images`
- `product_variants`
- `carts`
- `cart_items`
- `wishlist_items`
- `orders`
- `order_items`

Important relationships implemented in the migrations include:

- `users.user_type_id -> user_types.id`
- `sessions.user_id -> users.id`
- `product_images.product_id -> products.id`
- `product_variants.product_id -> products.id`
- `carts.user_id -> users.id`
- `cart_items.cart_id -> carts.id`
- `cart_items.product_variant_id -> product_variants.id`
- `wishlist_items.user_id -> users.id`
- `wishlist_items.product_id -> products.id`
- `orders.user_id -> users.id`
- `orders.cart_id -> carts.id`
- `order_items.order_id -> orders.id`
- `order_items.product_id -> products.id`
- `order_items.product_variant_id -> product_variants.id`

## Trade-Offs And Limitations

- The layered backend structure adds boilerplate, but it makes the codebase easier to test and reason about.
- Database-backed sessions add a lookup cost on authenticated requests, but session revocation is immediate and straightforward.
- String status fields backed by `CHECK` constraints are easier to modify within the current migration approach, although PostgreSQL enums would provide stronger type semantics.
- Some indexing decisions are provisional and would need measurement against real production traffic before being treated as final.
