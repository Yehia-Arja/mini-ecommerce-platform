import { HttpError } from "../http/errors.js";
import type { ProductsPaginationInput } from "./products.types.js";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 15;
const MAX_PAGE_SIZE = 50;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function parsePositiveInteger(
  rawValue: unknown,
  fieldName: "page" | "pageSize",
  fallback: number,
): number {
  if (rawValue == null || rawValue === "") {
    return fallback;
  }

  if (typeof rawValue !== "string") {
    throw new HttpError(400, `Query parameter "${fieldName}" must be a string.`);
  }

  const parsedValue = Number(rawValue);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    throw new HttpError(
      400,
      `Query parameter "${fieldName}" must be a positive integer.`,
    );
  }

  return parsedValue;
}

export function parseProductsPaginationQuery(
  query: Record<string, unknown>,
): ProductsPaginationInput {
  const page = parsePositiveInteger(query.page, "page", DEFAULT_PAGE);
  const pageSize = parsePositiveInteger(
    query.pageSize,
    "pageSize",
    DEFAULT_PAGE_SIZE,
  );

  if (pageSize > MAX_PAGE_SIZE) {
    throw new HttpError(
      400,
      `Query parameter "pageSize" must be at most ${MAX_PAGE_SIZE}.`,
    );
  }

  return {
    page,
    pageSize,
  };
}

export function parseProductId(rawValue: unknown): string {
  if (typeof rawValue !== "string" || rawValue.trim() === "") {
    throw new HttpError(400, 'Route parameter "productId" is required.');
  }

  if (!UUID_PATTERN.test(rawValue)) {
    throw new HttpError(400, 'Route parameter "productId" must be a valid UUID.');
  }

  return rawValue;
}
