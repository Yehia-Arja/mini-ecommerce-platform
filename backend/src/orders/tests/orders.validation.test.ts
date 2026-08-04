import assert from "node:assert/strict";
import test from "node:test";

import { HttpError } from "../../http/errors.js";
import { parseOrderId } from "../orders.validation.js";

test("parseOrderId returns a valid order id", () => {
  const result = parseOrderId("123e4567-e89b-12d3-a456-426614174000");

  assert.equal(result, "123e4567-e89b-12d3-a456-426614174000");
});

test("parseOrderId rejects invalid UUIDs", () => {
  assert.throws(
    () => parseOrderId("invalid"),
    (error: unknown) =>
      error instanceof HttpError &&
      error.statusCode === 400 &&
      error.message === 'Route parameter "orderId" must be a valid UUID.',
  );
});
