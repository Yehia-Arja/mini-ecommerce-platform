import assert from "node:assert/strict";
import test from "node:test";

import { HttpError } from "../../http/errors.js";
import {
  parseProductId,
  parseProductsPaginationQuery,
} from "../products.validation.js";

test("parseProductsPaginationQuery returns defaults when no query params are provided", () => {
  const result = parseProductsPaginationQuery({});

  assert.deepEqual(result, {
    page: 1,
    pageSize: 15,
  });
});

test("parseProductsPaginationQuery rejects invalid page values", () => {
  assert.throws(
    () => parseProductsPaginationQuery({ page: "0" }),
    (error: unknown) =>
      error instanceof HttpError &&
      error.statusCode === 400 &&
      error.message === 'Query parameter "page" must be a positive integer.',
  );
});

test("parseProductsPaginationQuery rejects pageSize values above the supported maximum", () => {
  assert.throws(
    () => parseProductsPaginationQuery({ pageSize: "51" }),
    (error: unknown) =>
      error instanceof HttpError &&
      error.statusCode === 400 &&
      error.message === 'Query parameter "pageSize" must be at most 50.',
  );
});

test("parseProductId returns a valid UUID product id", () => {
  const productId = "123e4567-e89b-12d3-a456-426614174000";

  assert.equal(parseProductId(productId), productId);
});

test("parseProductId rejects invalid product ids", () => {
  assert.throws(
    () => parseProductId("not-a-uuid"),
    (error: unknown) =>
      error instanceof HttpError &&
      error.statusCode === 400 &&
      error.message === 'Route parameter "productId" must be a valid UUID.',
  );
});
