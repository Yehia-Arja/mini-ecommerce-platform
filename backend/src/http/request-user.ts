import type { Request } from "express";

import { HttpError } from "./errors.js";

export function requireAuthenticatedUserId(request: Request): string {
  const userId = request.user?.id;

  if (!userId) {
    throw new HttpError(401, "Authentication is required.");
  }

  return userId;
}
