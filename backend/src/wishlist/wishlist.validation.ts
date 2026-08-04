import { parseJsonObject, parseUuid } from "../http/validation.js";
import type { AddWishlistItemInput } from "./wishlist.types.js";

export function parseWishlistItemId(rawValue: unknown): string {
  return parseUuid(rawValue, "wishlistItemId", "Route parameter");
}

export function parseAddWishlistItemInput(body: unknown): AddWishlistItemInput {
  const payload = parseJsonObject(body);

  return {
    productId: parseUuid(payload.productId, "productId", "Body field"),
  };
}
