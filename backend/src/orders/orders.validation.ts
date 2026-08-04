import { parseUuid } from "../http/validation.js";

export function parseOrderId(rawValue: unknown): string {
  return parseUuid(rawValue, "orderId", "Route parameter");
}
