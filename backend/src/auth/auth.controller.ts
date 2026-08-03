import type { NextFunction, Request, Response } from "express";

import type { AppConfig } from "../config.js";
import { sendNoContent, sendSuccess } from "../http/api-response.js";
import { HttpError } from "../http/errors.js";
import {
  buildAccessTokenCookie,
  buildExpiredAccessTokenCookie,
  buildExpiredRefreshTokenCookie,
  buildRefreshTokenCookie,
  parseCookieHeader,
} from "./session.js";
import { parseLoginInput } from "./auth.validation.js";
import type { AuthService } from "./auth.service.js";

function readRequestIpAddress(request: Request): string | null {
  return request.ip || null;
}

function readSessionId(request: Request, cookieName: string): string | null {
  const cookies = parseCookieHeader(request.headers.cookie);
  return cookies[cookieName] ?? null;
}

function buildAuthCookies(
  appConfig: AppConfig,
  session: Awaited<ReturnType<AuthService["login"]>>,
): string[] {
  return [
    buildAccessTokenCookie(
      appConfig.accessTokenCookieName,
      session.accessToken.id,
      appConfig.accessTokenTtlMinutes,
      appConfig.cookieSecure,
    ),
    buildRefreshTokenCookie(
      appConfig.refreshTokenCookieName,
      session.refreshToken.id,
      appConfig.refreshTokenTtlDays,
      appConfig.cookieSecure,
    ),
  ];
}

export type AuthController = {
  login: (
    request: Request,
    response: Response,
    next: NextFunction,
  ) => Promise<void>;
  refresh: (
    request: Request,
    response: Response,
    next: NextFunction,
  ) => Promise<void>;
  me: (
    request: Request,
    response: Response,
    next: NextFunction,
  ) => Promise<void>;
  logout: (
    request: Request,
    response: Response,
    next: NextFunction,
  ) => Promise<void>;
};

export function createAuthController(
  authService: AuthService,
  appConfig: AppConfig,
): AuthController {
  return {
    async login(request, response, next) {
      try {
        const input = parseLoginInput(
          request.body,
          readRequestIpAddress(request),
          request.get("user-agent") ?? null,
        );

        const session = await authService.login(input);

        response.setHeader(
          "Set-Cookie",
          buildAuthCookies(appConfig, session),
        );

        sendSuccess(
          response,
          200,
          { user: session.user },
          "User signed in successfully.",
        );
      } catch (error) {
        next(error);
      }
    },

    async refresh(request, response, next) {
      try {
        const refreshTokenId = readSessionId(
          request,
          appConfig.refreshTokenCookieName,
        );
        const session = await authService.refresh(refreshTokenId, {
          ipAddress: readRequestIpAddress(request),
          userAgent: request.get("user-agent") ?? null,
        });

        response.setHeader("Set-Cookie", buildAuthCookies(appConfig, session));

        sendSuccess(
          response,
          200,
          { user: session.user },
          "Session refreshed successfully.",
        );
      } catch (error) {
        next(error);
      }
    },

    async me(request, response, next) {
      try {
        const accessTokenId = readSessionId(
          request,
          appConfig.accessTokenCookieName,
        );
        const user = await authService.getCurrentUser(accessTokenId);

        if (!user) {
          throw new HttpError(401, "Authentication is required.");
        }

        sendSuccess(
          response,
          200,
          { user },
          "Authenticated user retrieved successfully.",
        );
      } catch (error) {
        next(error);
      }
    },

    async logout(request, response, next) {
      try {
        const accessTokenId = readSessionId(
          request,
          appConfig.accessTokenCookieName,
        );
        const refreshTokenId = readSessionId(
          request,
          appConfig.refreshTokenCookieName,
        );
        await authService.logout(accessTokenId, refreshTokenId);

        response.setHeader(
          "Set-Cookie",
          [
            buildExpiredAccessTokenCookie(
              appConfig.accessTokenCookieName,
              appConfig.cookieSecure,
            ),
            buildExpiredRefreshTokenCookie(
              appConfig.refreshTokenCookieName,
              appConfig.cookieSecure,
            ),
          ],
        );

        sendNoContent(response);
      } catch (error) {
        next(error);
      }
    },
  };
}
