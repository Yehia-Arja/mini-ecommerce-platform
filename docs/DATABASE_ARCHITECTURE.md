# Database Architecture

## Overview

The database layer uses PostgreSQL and is managed through ordered SQL migration files in `backend/migrations`. This document focuses on the schema itself: table relationships, integrity rules, deletion behavior, migration order, and database-specific trade-offs.

## Relationship Summary

```text
user_types        1 -- * users
users             1 -- * sessions
users             1 -- * carts
users             1 -- * orders
carts             1 -- * cart_items
products          1 -- * product_variants
products          1 -- * product_images
products          1 -- * wishlist_items
products          1 -- * order_items (nullable reference)
product_variants  1 -- * cart_items
product_variants  1 -- * order_items (nullable reference)
users             * -- * products (through wishlist_items)
orders            1 -- * order_items
```

## Tables And Relationships

### Identity and access

The authentication-related tables are:

- `user_types`
- `users`
- `sessions`

`users.user_type_id` references `user_types.id` with `ON DELETE RESTRICT`, which prevents deleting a referenced user type while users still depend on it.

`sessions.user_id` references `users.id` with `ON DELETE SET NULL`. That preserves historical session rows even if a user record is removed. `sessions.replaced_by_session_id` also uses `ON DELETE SET NULL`.

### Product catalog

The catalog is split across:

- `products`
- `product_images`
- `product_variants`

`product_images.product_id` and `product_variants.product_id` both reference `products.id` with `ON DELETE CASCADE`. Deleting a product removes its dependent images and variants automatically.

### Cart and wishlist

The shopping flow uses:

- `carts`
- `cart_items`
- `wishlist_items`

`carts.user_id` references `users.id` with `ON DELETE CASCADE`, so deleting a user removes that user's carts.

`cart_items.cart_id` references `carts.id` with `ON DELETE CASCADE`.

`cart_items.product_variant_id` references `product_variants.id` with `ON DELETE CASCADE`.

The schema also enforces one active cart per user through a partial unique index on `carts(user_id)` where `status = 'active'`.

`wishlist_items` acts as a junction table between users and products. Both foreign keys use `ON DELETE CASCADE`, and the `(user_id, product_id)` unique constraint prevents duplicate wishlist entries.

### Orders

Checkout is represented by:

- `orders`
- `order_items`

`orders.user_id` references `users.id` with `ON DELETE RESTRICT`, which prevents deleting a user while orders still depend on that user record.

`orders.cart_id` references `carts.id` with `ON DELETE SET NULL`, which allows an order to remain valid even if the source cart is later removed.

`order_items.order_id` references `orders.id` with `ON DELETE CASCADE`.

`order_items.product_id` and `order_items.product_variant_id` both use `ON DELETE SET NULL`. These references are intentionally nullable so historical order lines remain valid even if the original catalog records are later removed.

## Important Constraints

The schema uses database constraints to guard common invalid states:

- UUID primary keys across domain tables
- unique user email addresses
- unique product variant codes
- unique `(cart_id, product_variant_id)` in `cart_items`
- unique `(user_id, product_id)` in `wishlist_items`
- `CHECK` constraints for status values, non-negative prices, non-negative stock, positive quantities, and non-negative display order

## Order Snapshots

`order_items` stores `product_title`, `variant_name`, `variant_code`, `unit_price`, `quantity`, and `line_total` directly in the order record.

That snapshot is important because products and variants can change after checkout. Keeping the order-time values inside `order_items` preserves historical accuracy even if the catalog is updated or partially deleted later.

## Transaction Boundaries

Migration execution is transactional. The migration runner creates or checks the `schema_migrations` table, reads SQL files in lexical order, and runs each unapplied migration inside a transaction before recording it as applied.

The database layer also exposes transaction support through `withTransaction`, which is used in repository code for multi-step auth, cart, and order operations so related writes stay consistent.

## Migration Order

The current migration sequence is:

1. `0001_auth_foundation.sql`
2. `0002_seed_default_user.sql`
3. `0003_products_catalog_foundation.sql`
4. `0004_seed_product_catalog.sql`
5. `0005_cart_foundation.sql`
6. `0006_wishlist_items.sql`
7. `0007_checkout_orders.sql`

That order matters because later tables depend on earlier ones. Carts require users, cart items require product variants, and orders depend on users and carts.

## Database Trade-Offs

- Status fields are stored as strings with `CHECK` constraints rather than PostgreSQL enums.
- Some indexes were added for expected lookup paths, but their long-term value should be validated against real query patterns with `EXPLAIN ANALYZE`.
- Session rows are preserved with `SET NULL` relationships in some cases, which helps retain audit context but means some historical records may outlive their parent entities.
