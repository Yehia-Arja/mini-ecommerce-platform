import type { PoolClient, QueryResultRow } from "pg";

import { Database } from "../db/database.js";
import { HttpError } from "../http/errors.js";
import type {
  AddCartItemInput,
  Cart,
  CartItem,
  CartVariantRecord,
  UpdateCartItemInput,
} from "./cart.types.js";

type DatabaseExecutor = Database | PoolClient;

type CartRow = {
  id: string;
  user_id: string;
  status: "active" | "converted" | "abandoned";
  created_at: string;
  updated_at: string;
};

type CartItemRow = {
  id: string;
  quantity: number;
  product_variant_id: string;
  product_id: string;
  product_title: string;
  product_image_url: string | null;
  variant_name: string;
  variant_code: string;
  unit_price: string;
  override_price: string | null;
  stock_quantity: number;
};

type CartItemLookupRow = {
  id: string;
  cart_id: string;
  product_variant_id: string;
  quantity: number;
};

type VariantRow = {
  id: string;
  product_id: string;
  product_title: string;
  product_image_url: string | null;
  variant_name: string;
  variant_code: string;
  unit_price: string;
  override_price: string | null;
  stock_quantity: number;
  is_active: boolean;
  product_status: string;
};

type DatabaseError = Error & {
  code?: string;
};

export type CartRepositoryContract = {
  getCartByUserId(userId: string): Promise<Cart>;
  findVariantById(productVariantId: string): Promise<CartVariantRecord | null>;
  addItem(userId: string, input: AddCartItemInput): Promise<Cart>;
  findCartItemById(
    userId: string,
    cartItemId: string,
  ): Promise<{ id: string; cartId: string; productVariantId: string; quantity: number } | null>;
  findCartItemByVariantId(
    userId: string,
    productVariantId: string,
  ): Promise<{ id: string; cartId: string; productVariantId: string; quantity: number } | null>;
  updateItem(userId: string, cartItemId: string, input: UpdateCartItemInput): Promise<Cart>;
  removeItem(userId: string, cartItemId: string): Promise<boolean>;
};

const UNIQUE_VIOLATION_ERROR_CODE = "23505";

function throwStockAvailabilityError(): never {
  throw new HttpError(400, "Requested quantity exceeds available stock.");
}

function toMoney(value: string | null): number | null {
  if (value === null) {
    return null;
  }

  return Number(value);
}

function mapVariant(row: VariantRow): CartVariantRecord {
  return {
    id: row.id,
    productId: row.product_id,
    productTitle: row.product_title,
    productImageUrl: row.product_image_url,
    variantName: row.variant_name,
    variantCode: row.variant_code,
    unitPrice: Number(row.unit_price),
    overridePrice: toMoney(row.override_price),
    stockQuantity: row.stock_quantity,
    isActive: row.is_active,
    productStatus: row.product_status,
  };
}

async function executeQuery<T extends QueryResultRow>(
  executor: DatabaseExecutor,
  text: string,
  values: readonly unknown[] = [],
) {
  const query = executor.query.bind(executor) as (
    queryText: string,
    queryValues?: unknown[],
  ) => Promise<{ rows: T[]; rowCount?: number | null }>;

  return query(text, [...values]);
}

function isUniqueViolationError(error: unknown): error is DatabaseError {
  return (
    error instanceof Error &&
    "code" in error &&
    typeof (error as DatabaseError).code === "string" &&
    (error as DatabaseError).code === UNIQUE_VIOLATION_ERROR_CODE
  );
}

function buildEmptyCart(cart: CartRow): Cart {
  return {
    id: cart.id,
    userId: cart.user_id,
    status: cart.status,
    items: [],
    totalQuantity: 0,
    total: 0,
    createdAt: cart.created_at,
    updatedAt: cart.updated_at,
  };
}

function hydrateCart(cart: CartRow, itemRows: CartItemRow[]): Cart {
  if (!itemRows.length) {
    return buildEmptyCart(cart);
  }

  const items: CartItem[] = itemRows.map((row) => {
    const unitPrice = Number(row.unit_price);
    const subtotal = unitPrice * row.quantity;

    return {
      id: row.id,
      quantity: row.quantity,
      unitPrice,
      subtotal,
      product: {
        id: row.product_id,
        title: row.product_title,
        imageUrl: row.product_image_url,
      },
      variant: {
        id: row.product_variant_id,
        name: row.variant_name,
        code: row.variant_code,
        price: unitPrice,
        overridePrice: toMoney(row.override_price),
        stockQuantity: row.stock_quantity,
      },
    };
  });

  return {
    id: cart.id,
    userId: cart.user_id,
    status: cart.status,
    items,
    totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
    total: items.reduce((sum, item) => sum + item.subtotal, 0),
    createdAt: cart.created_at,
    updatedAt: cart.updated_at,
  };
}

export class CartRepository implements CartRepositoryContract {
  constructor(private readonly database: Database) {}

  async getCartByUserId(userId: string): Promise<Cart> {
    return this.database.withTransaction(async (client) => {
      const cart = await this.getOrCreateActiveCart(client, userId);
      return this.loadCart(client, cart.id);
    });
  }

  async findVariantById(productVariantId: string): Promise<CartVariantRecord | null> {
    const result = await this.database.query<VariantRow>(
      `
        SELECT
          product_variants.id,
          product_variants.product_id,
          products.title AS product_title,
          products.image_url AS product_image_url,
          product_variants.name AS variant_name,
          product_variants.code AS variant_code,
          COALESCE(product_variants.override_price, products.base_price)::TEXT AS unit_price,
          product_variants.override_price::TEXT,
          product_variants.stock_quantity,
          product_variants.is_active,
          products.status AS product_status
        FROM product_variants
        INNER JOIN products
          ON products.id = product_variants.product_id
        WHERE product_variants.id = $1
      `,
      [productVariantId],
    );

    const row = result.rows[0];
    return row ? mapVariant(row) : null;
  }

  async addItem(userId: string, input: AddCartItemInput): Promise<Cart> {
    return this.database.withTransaction(async (client) => {
      const cart = await this.getOrCreateActiveCart(client, userId);

      const result = await executeQuery(
        client,
        `
          INSERT INTO cart_items (cart_id, product_variant_id, quantity)
          SELECT $1, $2, $3
          FROM product_variants
          WHERE product_variants.id = $2
            AND product_variants.stock_quantity >= $3
          ON CONFLICT (cart_id, product_variant_id)
          DO UPDATE SET
            quantity = cart_items.quantity + EXCLUDED.quantity,
            updated_at = NOW()
          WHERE (
            SELECT product_variants.stock_quantity
            FROM product_variants
            WHERE product_variants.id = cart_items.product_variant_id
          ) >= cart_items.quantity + EXCLUDED.quantity
        `,
        [cart.id, input.productVariantId, input.quantity],
      );

      if ((result.rowCount ?? 0) === 0) {
        throwStockAvailabilityError();
      }

      await this.touchCart(client, cart.id);
      return this.loadCart(client, cart.id);
    });
  }

  async findCartItemById(
    userId: string,
    cartItemId: string,
  ): Promise<{ id: string; cartId: string; productVariantId: string; quantity: number } | null> {
    const result = await this.database.query<CartItemLookupRow>(
      `
        SELECT
          cart_items.id,
          cart_items.cart_id,
          cart_items.product_variant_id,
          cart_items.quantity
        FROM cart_items
        INNER JOIN carts
          ON carts.id = cart_items.cart_id
        WHERE cart_items.id = $1
          AND carts.user_id = $2
          AND carts.status = 'active'
      `,
      [cartItemId, userId],
    );

    const row = result.rows[0];

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      cartId: row.cart_id,
      productVariantId: row.product_variant_id,
      quantity: row.quantity,
    };
  }

  async findCartItemByVariantId(
    userId: string,
    productVariantId: string,
  ): Promise<{ id: string; cartId: string; productVariantId: string; quantity: number } | null> {
    const result = await this.database.query<CartItemLookupRow>(
      `
        SELECT
          cart_items.id,
          cart_items.cart_id,
          cart_items.product_variant_id,
          cart_items.quantity
        FROM cart_items
        INNER JOIN carts
          ON carts.id = cart_items.cart_id
        WHERE cart_items.product_variant_id = $1
          AND carts.user_id = $2
          AND carts.status = 'active'
      `,
      [productVariantId, userId],
    );

    const row = result.rows[0];

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      cartId: row.cart_id,
      productVariantId: row.product_variant_id,
      quantity: row.quantity,
    };
  }

  async updateItem(userId: string, cartItemId: string, input: UpdateCartItemInput): Promise<Cart> {
    return this.database.withTransaction(async (client) => {
      const item = await this.findCartItemByIdWithExecutor(client, userId, cartItemId);

      if (!item) {
        throw new Error("Cart item disappeared before update completed.");
      }

      const nextVariantId = input.productVariantId ?? item.product_variant_id;
      const nextQuantity = input.quantity ?? item.quantity;

      if (nextVariantId === item.product_variant_id) {
        const result = await executeQuery(
          client,
          `
            UPDATE cart_items
            SET
              quantity = $2,
              updated_at = NOW()
            WHERE id = $1
              AND EXISTS (
                SELECT 1
                FROM product_variants
                WHERE product_variants.id = cart_items.product_variant_id
                  AND product_variants.stock_quantity >= $2
              )
          `,
          [cartItemId, nextQuantity],
        );

        if ((result.rowCount ?? 0) === 0) {
          throwStockAvailabilityError();
        }
      } else {
        const conflictingItem = await this.findCartItemByVariantIdWithExecutor(
          client,
          item.cart_id,
          nextVariantId,
        );

        if (conflictingItem) {
          const result = await executeQuery(
            client,
            `
              UPDATE cart_items
              SET
                quantity = quantity + $2,
                updated_at = NOW()
              WHERE id = $1
                AND EXISTS (
                  SELECT 1
                  FROM product_variants
                  WHERE product_variants.id = cart_items.product_variant_id
                    AND product_variants.stock_quantity >= cart_items.quantity + $2
                )
            `,
            [conflictingItem.id, nextQuantity],
          );

          if ((result.rowCount ?? 0) === 0) {
            throwStockAvailabilityError();
          }

          await executeQuery(
            client,
            "DELETE FROM cart_items WHERE id = $1",
            [cartItemId],
          );
        } else {
          const result = await executeQuery(
            client,
            `
              UPDATE cart_items
              SET
                product_variant_id = $2,
                quantity = $3,
                updated_at = NOW()
              WHERE id = $1
                AND EXISTS (
                  SELECT 1
                  FROM product_variants
                  WHERE product_variants.id = $2
                    AND product_variants.stock_quantity >= $3
                )
            `,
            [cartItemId, nextVariantId, nextQuantity],
          );

          if ((result.rowCount ?? 0) === 0) {
            throwStockAvailabilityError();
          }
        }
      }

      await this.touchCart(client, item.cart_id);
      return this.loadCart(client, item.cart_id);
    });
  }

  async removeItem(userId: string, cartItemId: string): Promise<boolean> {
    return this.database.withTransaction(async (client) => {
      const item = await this.findCartItemByIdWithExecutor(client, userId, cartItemId);

      if (!item) {
        return false;
      }

      await executeQuery(client, "DELETE FROM cart_items WHERE id = $1", [cartItemId]);
      await this.touchCart(client, item.cart_id);
      return true;
    });
  }

  private async getOrCreateActiveCart(
    executor: DatabaseExecutor,
    userId: string,
  ): Promise<CartRow> {
    const cart = await this.findActiveCartByUserId(executor, userId);

    if (cart) {
      return cart;
    }

    try {
      const insertedCart = await executeQuery<CartRow>(
        executor,
        `
          INSERT INTO carts (user_id)
          VALUES ($1)
          RETURNING
            id,
            user_id,
            status,
            created_at::TEXT,
            updated_at::TEXT
        `,
        [userId],
      );

      const createdCart = insertedCart.rows[0];

      if (!createdCart) {
        throw new Error("Failed to create active cart.");
      }

      return createdCart;
    } catch (error) {
      if (!isUniqueViolationError(error)) {
        throw error;
      }

      const existingCart = await this.findActiveCartByUserId(executor, userId);

      if (!existingCart) {
        throw error;
      }

      return existingCart;
    }
  }

  private async loadCart(executor: DatabaseExecutor, cartId: string): Promise<Cart> {
    const cartResult = await executeQuery<CartRow>(
      executor,
      `
        SELECT
          id,
          user_id,
          status,
          created_at::TEXT,
          updated_at::TEXT
        FROM carts
        WHERE id = $1
      `,
      [cartId],
    );

    const cart = cartResult.rows[0];

    if (!cart) {
      throw new Error("Cart not found.");
    }

    const itemsResult = await executeQuery<CartItemRow>(
      executor,
      `
        SELECT
          cart_items.id,
          cart_items.quantity,
          product_variants.id AS product_variant_id,
          products.id AS product_id,
          products.title AS product_title,
          products.image_url AS product_image_url,
          product_variants.name AS variant_name,
          product_variants.code AS variant_code,
          COALESCE(product_variants.override_price, products.base_price)::TEXT AS unit_price,
          product_variants.override_price::TEXT,
          product_variants.stock_quantity
        FROM cart_items
        INNER JOIN product_variants
          ON product_variants.id = cart_items.product_variant_id
        INNER JOIN products
          ON products.id = product_variants.product_id
        WHERE cart_items.cart_id = $1
        ORDER BY cart_items.created_at ASC
      `,
      [cartId],
    );

    return hydrateCart(cart, itemsResult.rows);
  }

  private async touchCart(executor: DatabaseExecutor, cartId: string): Promise<void> {
    await executeQuery(
      executor,
      `
        UPDATE carts
        SET updated_at = NOW()
        WHERE id = $1
      `,
      [cartId],
    );
  }

  private async findCartItemByIdWithExecutor(
    executor: DatabaseExecutor,
    userId: string,
    cartItemId: string,
  ): Promise<CartItemLookupRow | null> {
    const result = await executeQuery<CartItemLookupRow>(
      executor,
      `
        SELECT
          cart_items.id,
          cart_items.cart_id,
          cart_items.product_variant_id,
          cart_items.quantity
        FROM cart_items
        INNER JOIN carts
          ON carts.id = cart_items.cart_id
        WHERE cart_items.id = $1
          AND carts.user_id = $2
          AND carts.status = 'active'
        FOR UPDATE
      `,
      [cartItemId, userId],
    );

    return result.rows[0] ?? null;
  }

  private async findActiveCartByUserId(
    executor: DatabaseExecutor,
    userId: string,
  ): Promise<CartRow | null> {
    const existingCart = await executeQuery<CartRow>(
      executor,
      `
        SELECT
          id,
          user_id,
          status,
          created_at::TEXT,
          updated_at::TEXT
        FROM carts
        WHERE user_id = $1
          AND status = 'active'
        LIMIT 1
        FOR UPDATE
      `,
      [userId],
    );

    return existingCart.rows[0] ?? null;
  }

  private async findCartItemByVariantIdWithExecutor(
    executor: DatabaseExecutor,
    cartId: string,
    productVariantId: string,
  ): Promise<CartItemLookupRow | null> {
    const result = await executeQuery<CartItemLookupRow>(
      executor,
      `
        SELECT
          id,
          cart_id,
          product_variant_id,
          quantity
        FROM cart_items
        WHERE cart_id = $1
          AND product_variant_id = $2
        FOR UPDATE
      `,
      [cartId, productVariantId],
    );

    return result.rows[0] ?? null;
  }
}
