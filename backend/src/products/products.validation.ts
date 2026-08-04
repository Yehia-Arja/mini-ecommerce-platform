import { HttpError } from "../http/errors.js";
import type { ProductsPaginationInput } from "./products.types.js";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 15;
const MAX_PAGE_SIZE = 50;

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
