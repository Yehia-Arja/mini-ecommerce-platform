import type { QueryResultRow } from "pg";

import { Database } from "../db/database.js";
import type {
  AddWishlistItemInput,
  Wishlist,
  WishlistItem,
  WishlistProductRecord,
} from "./wishlist.types.js";

type ProductRow = {
  id: string;
  status: string;
};

type WishlistItemRow = {
  id: string;
  created_at: string;
  product_id: string;
  product_title: string;
  product_description: string;
  product_price: string;
  product_image_url: string | null;
};

export type WishlistRepositoryContract = {
  getWishlistByUserId(userId: string): Promise<Wishlist>;
  findProductById(productId: string): Promise<WishlistProductRecord | null>;
  addItem(userId: string, input: AddWishlistItemInput): Promise<Wishlist>;
  removeItem(userId: string, wishlistItemId: string): Promise<boolean>;
};

async function executeQuery<T extends QueryResultRow>(
  database: Database,
  text: string,
  values: readonly unknown[] = [],
) {
  return database.query<T>(text, values);
}

function hydrateWishlist(userId: string, rows: WishlistItemRow[]): Wishlist {
  const items: WishlistItem[] = rows.map((row) => ({
    id: row.id,
    createdAt: row.created_at,
    product: {
      id: row.product_id,
      title: row.product_title,
      description: row.product_description,
      price: Number(row.product_price),
      imageUrl: row.product_image_url,
    },
  }));

  return {
    userId,
    items,
    totalItems: items.length,
  };
}

export class WishlistRepository implements WishlistRepositoryContract {
  constructor(private readonly database: Database) {}

  async getWishlistByUserId(userId: string): Promise<Wishlist> {
    const result = await executeQuery<WishlistItemRow>(
      this.database,
      `
        SELECT
          wishlist_items.id,
          wishlist_items.created_at::TEXT,
          products.id AS product_id,
          products.title AS product_title,
          products.description AS product_description,
          products.base_price::TEXT AS product_price,
          products.image_url AS product_image_url
        FROM wishlist_items
        INNER JOIN products
          ON products.id = wishlist_items.product_id
        WHERE wishlist_items.user_id = $1
        ORDER BY wishlist_items.created_at ASC
      `,
      [userId],
    );

    return hydrateWishlist(userId, result.rows);
  }

  async findProductById(productId: string): Promise<WishlistProductRecord | null> {
    const result = await executeQuery<ProductRow>(
      this.database,
      `
        SELECT id, status
        FROM products
        WHERE id = $1
      `,
      [productId],
    );

    const row = result.rows[0];

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      status: row.status,
    };
  }

  async addItem(userId: string, input: AddWishlistItemInput): Promise<Wishlist> {
    await executeQuery(
      this.database,
      `
        INSERT INTO wishlist_items (user_id, product_id)
        VALUES ($1, $2)
        ON CONFLICT (user_id, product_id) DO NOTHING
      `,
      [userId, input.productId],
    );

    return this.getWishlistByUserId(userId);
  }

  async removeItem(userId: string, wishlistItemId: string): Promise<boolean> {
    const result = await executeQuery(
      this.database,
      `
        DELETE FROM wishlist_items
        WHERE id = $1
          AND user_id = $2
      `,
      [wishlistItemId, userId],
    );

    return (result.rowCount ?? 0) > 0;
  }
}
