import { HttpError } from "./errors.js";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function parseUuid(rawValue: unknown, fieldName: string, location: string): string {
  if (typeof rawValue !== "string" || rawValue.trim() === "") {
    throw new HttpError(400, `${location} "${fieldName}" is required.`);
  }

  if (!UUID_PATTERN.test(rawValue)) {
    throw new HttpError(400, `${location} "${fieldName}" must be a valid UUID.`);
  }

  return rawValue;
}

export function parseJsonObject(body: unknown): Record<string, unknown> {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new HttpError(400, "Request body must be a JSON object.");
  }

  return body as Record<string, unknown>;
}
