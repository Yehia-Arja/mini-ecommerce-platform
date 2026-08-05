# Backend Architecture

## Overview

The backend is implemented with Express and TypeScript and is organized as a layered feature-based application. Each business domain is separated into route, controller, service, repository, and validation modules.

The active backend domains are:

- `auth`
- `products`
- `cart`
- `wishlist`
- `orders`

## Request Flow

The backend uses this request path:

`route -> controller -> service -> repository -> PostgreSQL`

Routes define endpoints and apply middleware. Controllers translate HTTP input into service calls. Services contain business rules. Repositories contain SQL access and persistence-specific mapping.

This separation adds some boilerplate, but it keeps HTTP behavior, business rules, and database operations independently testable as the required features grow.

## Application Composition

The backend is assembled in `backend/src/server.ts`. The startup flow:

- loads environment configuration
- creates the PostgreSQL connection
- instantiates repositories and services
- builds controllers and feature routers
- mounts routes into the Express application
- starts the HTTP server
- registers graceful shutdown handlers for `SIGINT` and `SIGTERM`

The mounted API routes are:

- `/api/auth`
- `/api/products`
- `/api/cart`
- `/api/wishlist`
- `/api/orders`
- `/api/health`

## Authentication And Session Handling

Authentication is implemented with opaque database-backed sessions instead of JWTs.

The current flow is:

- login verifies the submitted credentials against the stored password hash
- the backend issues an access session and a refresh session
- both session identifiers are stored in the `sessions` table
- cookies are sent back to the browser
- protected routes resolve the current user from the access cookie

The cookie behavior implemented in the code is:

- access cookie path: `/`
- refresh cookie path: `/api/auth`
- `HttpOnly`
- `SameSite=Lax`
- optional `Secure` depending on environment configuration

The `AuthService` currently handles:

- login
- refresh token rotation
- current user lookup
- logout

Protected endpoints use `createRequireAuthMiddleware`, which reads the configured access cookie and resolves the current user before the request reaches the feature controller.

## Validation And Error Handling

Each domain has its own validation module. Request parsing happens before business logic is executed so malformed input is rejected consistently.

The Express application also applies:

- CORS with credential support
- JSON body parsing
- centralized not-found handling
- centralized error handling
- shared API response helpers

That keeps endpoint behavior more consistent across the application and reduces repeated controller code.

## Transactions And Persistence

Database access is centralized through the `Database` class in `backend/src/db/database.ts`, which wraps the PostgreSQL connection pool and exposes `withTransaction`.

Transactional writes are currently used in:

- auth repository operations
- cart repository operations
- order repository operations
- migration execution

This is important because session rotation, cart updates, and checkout-related writes all involve multi-step persistence that should not leave partial state behind if one step fails.

## Backend Trade-Offs

- The layered structure is more verbose than a smaller handler-only Express app.
- Database-backed sessions require a lookup for authenticated requests.
- The current architecture is intentionally centralized around one backend service rather than multiple independently deployed services.
