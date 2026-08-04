import type { QueryResultRow } from "pg";

import { Database } from "../db/database.js";
import type {
  ProductImage,
  ProductListItem,
  ProductVariant,
  ProductsPaginationInput,
} from "./products.types.js";

type CountRow = {
  count: string;
};

type ProductRow = {
  id: string;
  title: string;
  description: string;
  base_price: string;
  image_url: string | null;
};

type ProductImageRow = {
  id: string;
  product_id: string;
  image_url: string;
  display_order: number;
  is_primary: boolean;
};

type ProductVariantRow = {
  id: string;
  product_id: string;
  name: string;
  code: string;
  override_price: string | null;
  stock_quantity: number;
  is_active: boolean;
};

export type ProductsRepositoryContract = {
  listProducts(
    input: ProductsPaginationInput,
  ): Promise<{ items: ProductListItem[]; totalItems: number }>;
};

function toMoney(value: string | null): number | null {
  if (value === null) {
    return null;
  }

  return Number(value);
}

function buildFallbackImages(product: ProductRow): ProductImage[] {
  if (!product.image_url) {
    return [];
  }

  return [
    {
      id: null,
      imageUrl: product.image_url,
      displayOrder: 0,
      isPrimary: true,
    },
  ];
}

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

    const productsResult = await executeQuery<ProductRow>(
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

    const productIds = products.map((product) => product.id);
    const productsById = new Map(
      products.map((product) => [product.id, product] as const),
    );

    const [imagesResult, variantsResult] = await Promise.all([
      executeQuery<ProductImageRow>(
        this.database,
        `
          SELECT
            id,
            product_id,
            image_url,
            display_order,
            is_primary
          FROM product_images
          WHERE product_id = ANY($1::uuid[])
          ORDER BY is_primary DESC, display_order ASC, created_at ASC
        `,
        [productIds],
      ),
      executeQuery<ProductVariantRow>(
        this.database,
        `
          SELECT
            id,
            product_id,
            name,
            code,
            override_price::TEXT,
            stock_quantity,
            is_active
          FROM product_variants
          WHERE product_id = ANY($1::uuid[])
            AND is_active = TRUE
          ORDER BY created_at ASC, name ASC
        `,
        [productIds],
      ),
    ]);

    const imagesByProductId = new Map<string, ProductImage[]>();
    const variantsByProductId = new Map<string, ProductVariant[]>();

    for (const row of imagesResult.rows) {
      const productImages = imagesByProductId.get(row.product_id) ?? [];
      productImages.push({
        id: row.id,
        imageUrl: row.image_url,
        displayOrder: row.display_order,
        isPrimary: row.is_primary,
      });
      imagesByProductId.set(row.product_id, productImages);
    }

    for (const product of products) {
      if (!imagesByProductId.has(product.id)) {
        imagesByProductId.set(product.id, buildFallbackImages(product));
      }
    }

    for (const row of variantsResult.rows) {
      const product = productsById.get(row.product_id);

      if (!product) {
        continue;
      }

      const basePrice = Number(product.base_price);
      const overridePrice = toMoney(row.override_price);
      const productVariants = variantsByProductId.get(row.product_id) ?? [];

      productVariants.push({
        id: row.id,
        name: row.name,
        code: row.code,
        price: overridePrice ?? basePrice,
        overridePrice,
        stockQuantity: row.stock_quantity,
        isActive: row.is_active,
      });

      variantsByProductId.set(row.product_id, productVariants);
    }

    return {
      items: products.map((product) => ({
        id: product.id,
        title: product.title,
        description: product.description,
        price: Number(product.base_price),
        imageUrl: product.image_url,
        images: imagesByProductId.get(product.id) ?? [],
        variants: variantsByProductId.get(product.id) ?? [],
      })),
      totalItems,
    };
  }
}
