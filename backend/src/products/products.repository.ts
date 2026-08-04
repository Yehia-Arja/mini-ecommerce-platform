import type { QueryResultRow } from "pg";

import { Database } from "../db/database.js";
import {
  hydrateProducts,
  type ProductHydrationRow,
} from "./product-hydration.js";
import type {
  ProductListItem,
  ProductsPaginationInput,
} from "./products.types.js";

type CountRow = {
  count: string;
};

export type ProductsRepositoryContract = {
  listProducts(
    input: ProductsPaginationInput,
  ): Promise<{ items: ProductListItem[]; totalItems: number }>;
  getProductById(productId: string): Promise<ProductListItem | null>;
};

async function executeQuery<T extends QueryResultRow>(
  database: Database,
  text: string,
  values: readonly unknown[] = [],
) {
  return database.query<T>(text, values);
}

export class ProductsRepository implements ProductsRepositoryContract {
  constructor(private readonly database: Database) {}

  async listProducts(
    input: ProductsPaginationInput,
  ): Promise<{ items: ProductListItem[]; totalItems: number }> {
    const totalItemsResult = await executeQuery<CountRow>(
      this.database,
      `
        SELECT COUNT(*)::TEXT AS count
        FROM products
        WHERE status = 'active'
      `,
    );

    const totalItems = Number(totalItemsResult.rows[0]?.count ?? 0);
    const offset = (input.page - 1) * input.pageSize;

    const productsResult = await executeQuery<ProductHydrationRow>(
      this.database,
      `
        SELECT
          id,
          title,
          description,
          base_price::TEXT,
          image_url
        FROM products
        WHERE status = 'active'
        ORDER BY created_at ASC, title ASC
        LIMIT $1
        OFFSET $2
      `,
      [input.pageSize, offset],
    );

    const products = productsResult.rows;

    if (!products.length) {
      return {
        items: [],
        totalItems,
      };
    }

    return {
      items: await hydrateProducts(this.database, products),
      totalItems,
    };
  }

  async getProductById(productId: string): Promise<ProductListItem | null> {
    const productResult = await executeQuery<ProductHydrationRow>(
      this.database,
      `
        SELECT
          id,
          title,
          description,
          base_price::TEXT,
          image_url
        FROM products
        WHERE id = $1
          AND status = 'active'
      `,
      [productId],
    );

    const product = productResult.rows[0];

    if (!product) {
      return null;
    }

    const [productDetails] = await hydrateProducts(this.database, [product]);
    return productDetails ?? null;
  }
}
