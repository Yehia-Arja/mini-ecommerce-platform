import assert from "node:assert/strict";
import test from "node:test";

import { HttpError } from "../../http/errors.js";
import {
  parseAddWishlistItemInput,
  parseWishlistItemId,
} from "../wishlist.validation.js";

test("parseAddWishlistItemInput returns a valid payload", () => {
  const result = parseAddWishlistItemInput({
    productId: "123e4567-e89b-12d3-a456-426614174000",
  });

  assert.deepEqual(result, {
    productId: "123e4567-e89b-12d3-a456-426614174000",
  });
});

test("parseAddWishlistItemInput rejects missing product ids", () => {
  assert.throws(
    () =>
      parseAddWishlistItemInput({
        productId: "",
      }),
    (error: unknown) =>
      error instanceof HttpError &&
      error.statusCode === 400 &&
      error.message === 'Body field "productId" is required.',
  );
});

test("parseWishlistItemId rejects invalid UUIDs", () => {
  assert.throws(
    () => parseWishlistItemId("invalid"),
    (error: unknown) =>
      error instanceof HttpError &&
      error.statusCode === 400 &&
      error.message === 'Route parameter "wishlistItemId" must be a valid UUID.',
  );
});
