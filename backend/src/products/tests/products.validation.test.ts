import assert from "node:assert/strict";
import test from "node:test";

import { HttpError } from "../../http/errors.js";
import { parseProductsPaginationQuery } from "../products.validation.js";

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
