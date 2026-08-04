import assert from "node:assert/strict";
import test from "node:test";

import { createApp } from "../../app.js";
import { createAuthController } from "../auth.controller.js";
import { createAuthRoutes } from "../auth.routes.js";
import type { AuthService } from "../auth.service.js";

const testConfig = {
  frontendUrl: "http://localhost:5173",
  nodeEnv: "test" as const,
  accessTokenCookieName: "test_access",
  refreshTokenCookieName: "test_refresh",
  accessTokenTtlMinutes: 15,
  refreshTokenTtlDays: 30,
  cookieSecure: false,
};

test("login returns both access and refresh cookies", async () => {
  const authService = {
    async login() {
      return {
        user: {
          id: "user-1",
          firstName: "Yehia",
          lastName: null,
          email: "yehia@example.com",
          phoneNumber: null,
          status: "active",
          emailVerifiedAt: null,
          userType: "customer",
          loginCount: 1,
          lastLoginIp: null,
          lastLoginAt: null,
          language: "en",
          countryCode: null,
          registrationIp: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        accessToken: {
          id: "access-1",
          userId: "user-1",
          user: {} as never,
          tokenType: "access" as const,
          expiresAt: new Date(Date.now() + 60_000).toISOString(),
          revokedAt: null,
        },
        refreshToken: {
          id: "refresh-1",
          userId: "user-1",
          user: {} as never,
          tokenType: "refresh" as const,
          expiresAt: new Date(Date.now() + 60_000).toISOString(),
          revokedAt: null,
        },
      };
    },
    async refresh() {
      throw new Error("Not implemented in this test.");
    },
    async getCurrentUser() {
      return null;
    },
    async logout() {},
  } satisfies Pick<AuthService, "login" | "refresh" | "getCurrentUser" | "logout">;

  const controller = createAuthController(
    authService as AuthService,
    testConfig,
  );
  const app = createApp(testConfig, {
    authRouter: createAuthRoutes(controller),
  });
  const server = app.listen(0);

  try {
    const address = server.address();

    if (!address || typeof address === "string") {
      throw new Error("Expected numeric server port.");
    }

    const response = await fetch(`http://127.0.0.1:${address.port}/api/auth/login`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        email: "yehia@example.com",
        password: "Customer@123",
      }),
    });

    const cookies = response.headers.getSetCookie();

    assert.equal(response.status, 200);
    assert.equal(cookies.length, 2);
    assert.match(cookies[0] ?? "", /^test_access=/);
    assert.match(cookies[1] ?? "", /^test_refresh=/);
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }
});
