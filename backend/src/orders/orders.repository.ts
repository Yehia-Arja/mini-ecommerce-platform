import type { PoolClient, QueryResultRow } from "pg";

import { Database } from "../db/database.js";
import { HttpError } from "../http/errors.js";
import type { Order, OrderItem } from "./orders.types.js";

type DatabaseExecutor = Database | PoolClient;

type CartRow = {
  id: string;
};

type CheckoutItemRow = {
  quantity: number;
  product_id: string;
  product_title: string;
  product_variant_id: string;
  variant_name: string;
  variant_code: string;
  unit_price: string;
  stock_quantity: number;
  variant_is_active: boolean;
  product_status: string;
};

type OrderRow = {
  id: string;
  user_id: string;
  cart_id: string | null;
  status: "confirmed" | "cancelled";
  total_amount: string;
  created_at: string;
  updated_at: string;
};

type OrderItemRow = {
  id: string;
  product_id: string | null;
  product_variant_id: string | null;
  product_title: string;
  variant_name: string;
  variant_code: string;
  unit_price: string;
  quantity: number;
  line_total: string;
  created_at: string;
};

type OrderInsertRow = {
  id: string;
};

type CheckoutSnapshotItem = {
  productId: string;
  productVariantId: string;
  productTitle: string;
  variantName: string;
  variantCode: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

export type OrdersRepositoryContract = {
  placeOrder(userId: string): Promise<Order>;
  getOrderById(userId: string, orderId: string): Promise<Order | null>;
};

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

function toMoney(value: string): number {
  return Number(value);
}

function toMoneyCents(value: string): number {
  return Math.round(Number(value) * 100);
}

function formatMoneyFromCents(cents: number): string {
  return (cents / 100).toFixed(2);
}

function mapOrderItem(row: OrderItemRow): OrderItem {
  return {
    id: row.id,
    productId: row.product_id,
    productVariantId: row.product_variant_id,
    productTitle: row.product_title,
    variantName: row.variant_name,
    variantCode: row.variant_code,
    unitPrice: toMoney(row.unit_price),
    quantity: row.quantity,
    lineTotal: toMoney(row.line_total),
    createdAt: row.created_at,
  };
}

function hydrateOrder(order: OrderRow, itemRows: OrderItemRow[]): Order {
  const items = itemRows.map(mapOrderItem);

  return {
    id: order.id,
    userId: order.user_id,
    cartId: order.cart_id,
    status: order.status,
    totalAmount: toMoney(order.total_amount),
    totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
    items,
    createdAt: order.created_at,
    updatedAt: order.updated_at,
  };
}

function assertCheckoutItemsArePurchasable(itemRows: CheckoutItemRow[]) {
  for (const item of itemRows) {
    if (!item.variant_is_active || item.product_status !== "active") {
      throw new HttpError(400, "Cart contains unavailable items.");
    }

    if (item.quantity > item.stock_quantity) {
      throw new HttpError(400, "Cart contains items with insufficient stock.");
    }
  }
}

export class OrdersRepository implements OrdersRepositoryContract {
  constructor(private readonly database: Database) {}

  async placeOrder(userId: string): Promise<Order> {
    return this.database.withTransaction(async (client) => {
      const cart = await this.findActiveCartByUserId(client, userId);

      if (!cart) {
        throw new HttpError(400, "Cart is empty.");
      }

      const checkoutItems = await this.loadCheckoutItems(client, cart.id);

      if (!checkoutItems.length) {
        throw new HttpError(400, "Cart is empty.");
      }

      assertCheckoutItemsArePurchasable(checkoutItems);

      const snapshotItems: CheckoutSnapshotItem[] = checkoutItems.map((item) => {
        const unitPriceCents = toMoneyCents(item.unit_price);

        return {
          productId: item.product_id,
          productVariantId: item.product_variant_id,
          productTitle: item.product_title,
          variantName: item.variant_name,
          variantCode: item.variant_code,
          unitPrice: toMoney(item.unit_price),
          quantity: item.quantity,
          lineTotal: Number(
            formatMoneyFromCents(unitPriceCents * item.quantity),
          ),
        };
      });
      const totalAmountCents = snapshotItems.reduce(
        (sum, item) => sum + Math.round(item.lineTotal * 100),
        0,
      );
      const insertedOrder = await executeQuery<OrderInsertRow>(
        client,
        `
          INSERT INTO orders (user_id, cart_id, total_amount)
          VALUES ($1, $2, $3)
          RETURNING id
        `,
        [userId, cart.id, formatMoneyFromCents(totalAmountCents)],
      );
      const orderId = insertedOrder.rows[0]?.id;

      if (!orderId) {
        throw new Error("Failed to create order.");
      }

      for (const item of snapshotItems) {
        await executeQuery(
          client,
          `
            INSERT INTO order_items (
              order_id,
              product_id,
              product_variant_id,
              product_title,
              variant_name,
              variant_code,
              unit_price,
              quantity,
              line_total
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          `,
          [
            orderId,
            item.productId,
            item.productVariantId,
            item.productTitle,
            item.variantName,
            item.variantCode,
            formatMoneyFromCents(Math.round(item.unitPrice * 100)),
            item.quantity,
            formatMoneyFromCents(Math.round(item.lineTotal * 100)),
          ],
        );

        await executeQuery(
          client,
          `
            UPDATE product_variants
            SET
              stock_quantity = stock_quantity - $2,
              updated_at = NOW()
            WHERE id = $1
          `,
          [item.productVariantId, item.quantity],
        );
      }

      await executeQuery(
        client,
        `
          UPDATE carts
          SET
            status = 'converted',
            updated_at = NOW()
          WHERE id = $1
        `,
        [cart.id],
      );

      const order = await this.loadOrderById(client, userId, orderId);

      if (!order) {
        throw new Error("Order disappeared after checkout.");
      }

      return order;
    });
  }

  async getOrderById(userId: string, orderId: string): Promise<Order | null> {
    return this.loadOrderById(this.database, userId, orderId);
  }

  private async findActiveCartByUserId(
    executor: DatabaseExecutor,
    userId: string,
  ): Promise<CartRow | null> {
    const result = await executeQuery<CartRow>(
      executor,
      `
        SELECT
          id
        FROM carts
        WHERE user_id = $1
          AND status = 'active'
        ORDER BY updated_at DESC, created_at DESC
        LIMIT 1
        FOR UPDATE
      `,
      [userId],
    );

    return result.rows[0] ?? null;
  }

  private async loadCheckoutItems(
    executor: DatabaseExecutor,
    cartId: string,
  ): Promise<CheckoutItemRow[]> {
    const result = await executeQuery<CheckoutItemRow>(
      executor,
      `
        SELECT
          cart_items.quantity,
          products.id AS product_id,
          products.title AS product_title,
          product_variants.id AS product_variant_id,
          product_variants.name AS variant_name,
          product_variants.code AS variant_code,
          COALESCE(product_variants.override_price, products.base_price)::TEXT AS unit_price,
          product_variants.stock_quantity,
          product_variants.is_active AS variant_is_active,
          products.status AS product_status
        FROM cart_items
        INNER JOIN product_variants
          ON product_variants.id = cart_items.product_variant_id
        INNER JOIN products
          ON products.id = product_variants.product_id
        WHERE cart_items.cart_id = $1
        ORDER BY cart_items.created_at ASC
        FOR UPDATE OF cart_items, product_variants, products
      `,
      [cartId],
    );

    return result.rows;
  }

  private async loadOrderById(
    executor: DatabaseExecutor,
    userId: string,
    orderId: string,
  ): Promise<Order | null> {
    const orderResult = await executeQuery<OrderRow>(
      executor,
      `
        SELECT
          id,
          user_id,
          cart_id,
          status,
          total_amount::TEXT,
          created_at::TEXT,
          updated_at::TEXT
        FROM orders
        WHERE id = $1
          AND user_id = $2
      `,
      [orderId, userId],
    );
    const order = orderResult.rows[0];

    if (!order) {
      return null;
    }

    const itemsResult = await executeQuery<OrderItemRow>(
      executor,
      `
        SELECT
          id,
          product_id,
          product_variant_id,
          product_title,
          variant_name,
          variant_code,
          unit_price::TEXT,
          quantity,
          line_total::TEXT,
          created_at::TEXT
        FROM order_items
        WHERE order_id = $1
        ORDER BY created_at ASC
      `,
      [orderId],
    );

    return hydrateOrder(order, itemsResult.rows);
  }
}
