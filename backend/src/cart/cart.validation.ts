import { HttpError } from "../http/errors.js";
import { parseJsonObject, parseUuid } from "../http/validation.js";
import type { AddCartItemInput, UpdateCartItemInput } from "./cart.types.js";

function parseQuantity(rawValue: unknown, fieldName = "quantity"): number {
  if (typeof rawValue !== "number" || !Number.isInteger(rawValue) || rawValue <= 0) {
    throw new HttpError(400, `Body field "${fieldName}" must be a positive integer.`);
  }

  return rawValue;
}

export function parseCartItemId(rawValue: unknown): string {
  return parseUuid(rawValue, "cartItemId", 'Route parameter');
}

export function parseAddCartItemInput(body: unknown): AddCartItemInput {
  const payload = parseJsonObject(body);

  return {
    productVariantId: parseUuid(
      payload.productVariantId,
      "productVariantId",
      "Body field",
    ),
    quantity: parseQuantity(payload.quantity),
  };
}

export function parseUpdateCartItemInput(body: unknown): UpdateCartItemInput {
  const payload = parseJsonObject(body);
  const quantity = payload.quantity;
  const productVariantId = payload.productVariantId;

  if (quantity == null && productVariantId == null) {
    throw new HttpError(
      400,
      'Request body must include at least one of "quantity" or "productVariantId".',
    );
  }

  const result: UpdateCartItemInput = {};

  if (quantity != null) {
    result.quantity = parseQuantity(quantity);
  }

  if (productVariantId != null) {
    result.productVariantId = parseUuid(
      productVariantId,
      "productVariantId",
      "Body field",
    );
  }

  return result;
}
