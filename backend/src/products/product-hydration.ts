import type { QueryResultRow } from "pg";

import { Database } from "../db/database.js";
import type { ProductImage, ProductListItem, ProductVariant } from "./products.types.js";

export type ProductHydrationRow = {
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

function toMoney(value: string | null): number | null {
  if (value === null) {
    return null;
  }

  return Number(value);
}

function buildFallbackImages(product: ProductHydrationRow): ProductImage[] {
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

async function loadProductImages(
  database: Database,
  productIds: string[],
) {
  if (!productIds.length) {
    return new Map<string, ProductImage[]>();
  }

  const imagesResult = await executeQuery<ProductImageRow>(
    database,
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
  );

  const imagesByProductId = new Map<string, ProductImage[]>();

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

  return imagesByProductId;
}

async function loadProductVariants(
  database: Database,
  productsById: Map<string, ProductHydrationRow>,
  productIds: string[],
) {
  if (!productIds.length) {
    return new Map<string, ProductVariant[]>();
  }

  const variantsResult = await executeQuery<ProductVariantRow>(
    database,
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
  );

  const variantsByProductId = new Map<string, ProductVariant[]>();

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

  return variantsByProductId;
}

export async function hydrateProducts(
  database: Database,
  products: ProductHydrationRow[],
): Promise<ProductListItem[]> {
  if (!products.length) {
    return [];
  }

  const productIds = products.map((product) => product.id);
  const productsById = new Map(
    products.map((product) => [product.id, product] as const),
  );

  const [imagesByProductId, variantsByProductId] = await Promise.all([
    loadProductImages(database, productIds),
    loadProductVariants(database, productsById, productIds),
  ]);

  for (const product of products) {
    if (!imagesByProductId.has(product.id)) {
      imagesByProductId.set(product.id, buildFallbackImages(product));
    }
  }

  return products.map((product) => ({
    id: product.id,
    title: product.title,
    description: product.description,
    price: Number(product.base_price),
    imageUrl: product.image_url,
    images: imagesByProductId.get(product.id) ?? [],
    variants: variantsByProductId.get(product.id) ?? [],
  }));
}
