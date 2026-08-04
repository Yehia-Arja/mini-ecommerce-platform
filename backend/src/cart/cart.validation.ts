import { HttpError } from "../http/errors.js";
import type { AddCartItemInput, UpdateCartItemInput } from "./cart.types.js";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function parseUuid(rawValue: unknown, fieldName: string, location: string): string {
  if (typeof rawValue !== "string" || rawValue.trim() === "") {
    throw new HttpError(400, `${location} "${fieldName}" is required.`);
  }

  if (!UUID_PATTERN.test(rawValue)) {
    throw new HttpError(400, `${location} "${fieldName}" must be a valid UUID.`);
  }

  return rawValue;
}

function parseQuantity(rawValue: unknown, fieldName = "quantity"): number {
  if (typeof rawValue !== "number" || !Number.isInteger(rawValue) || rawValue <= 0) {
    throw new HttpError(400, `Body field "${fieldName}" must be a positive integer.`);
  }

  return rawValue;
}

function parseBody(body: unknown): Record<string, unknown> {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new HttpError(400, "Request body must be a JSON object.");
  }

  return body as Record<string, unknown>;
}

export function parseCartItemId(rawValue: unknown): string {
  return parseUuid(rawValue, "cartItemId", 'Route parameter');
}

export function parseAddCartItemInput(body: unknown): AddCartItemInput {
  const payload = parseBody(body);

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
  const payload = parseBody(body);
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
