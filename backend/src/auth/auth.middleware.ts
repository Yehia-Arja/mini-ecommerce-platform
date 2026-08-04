import type { NextFunction, Request, Response } from "express";

import type { AppConfig } from "../config.js";
import { HttpError } from "../http/errors.js";
import { readCookieValue } from "./session.js";
import type { AuthService } from "./auth.service.js";

type RequireAuthService = Pick<AuthService, "getCurrentUser">;
type AuthCookieConfig = Pick<AppConfig, "accessTokenCookieName">;

export function createRequireAuthMiddleware(
  authService: RequireAuthService,
  appConfig: AuthCookieConfig,
) {
  return async function requireAuth(
    request: Request,
    _response: Response,
    next: NextFunction,
  ) {
    try {
      const accessTokenId = readCookieValue(
        request.headers.cookie,
        appConfig.accessTokenCookieName,
      );
      const user = await authService.getCurrentUser(accessTokenId);

      if (!user) {
        throw new HttpError(401, "Authentication is required.");
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
