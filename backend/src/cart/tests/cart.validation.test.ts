import assert from "node:assert/strict";
import test from "node:test";

import { HttpError } from "../../http/errors.js";
import {
  parseAddCartItemInput,
  parseCartItemId,
  parseUpdateCartItemInput,
} from "../cart.validation.js";

test("parseAddCartItemInput returns a valid payload", () => {
  const payload = parseAddCartItemInput({
    productVariantId: "123e4567-e89b-12d3-a456-426614174000",
    quantity: 2,
  });

  assert.deepEqual(payload, {
    productVariantId: "123e4567-e89b-12d3-a456-426614174000",
    quantity: 2,
  });
});

test("parseAddCartItemInput rejects non-positive quantities", () => {
  assert.throws(
    () =>
      parseAddCartItemInput({
        productVariantId: "123e4567-e89b-12d3-a456-426614174000",
        quantity: 0,
      }),
    (error: unknown) =>
      error instanceof HttpError &&
      error.statusCode === 400 &&
      error.message === 'Body field "quantity" must be a positive integer.',
  );
});

test("parseUpdateCartItemInput requires at least one mutable field", () => {
  assert.throws(
    () => parseUpdateCartItemInput({}),
    (error: unknown) =>
      error instanceof HttpError &&
      error.statusCode === 400 &&
      error.message ===
        'Request body must include at least one of "quantity" or "productVariantId".',
  );
});

test("parseCartItemId rejects invalid UUIDs", () => {
  assert.throws(
    () => parseCartItemId("nope"),
    (error: unknown) =>
      error instanceof HttpError &&
      error.statusCode === 400 &&
      error.message === 'Route parameter "cartItemId" must be a valid UUID.',
  );
});
