import test from "node:test";
import assert from "node:assert/strict";

import { createApp } from "./app.js";
import {
  getAppConfig,
  parseAccessTokenTtlMinutes,
  parsePort,
  parseRefreshTokenTtlDays,
} from "./config.js";

test("parsePort falls back to the default for invalid values", () => {
  assert.equal(parsePort(undefined), 3000);
  assert.equal(parsePort(""), 3000);
  assert.equal(parsePort("abc"), 3000);
  assert.equal(parsePort("-1"), 3000);
});

test("getAppConfig uses environment overrides when provided", () => {
  const config = getAppConfig({
    FRONTEND_URL: "http://localhost:4173",
    NODE_ENV: "production",
    ACCESS_TOKEN_COOKIE_NAME: "custom_access",
    REFRESH_TOKEN_COOKIE_NAME: "custom_refresh",
    ACCESS_TOKEN_TTL_MINUTES: "20",
    REFRESH_TOKEN_TTL_DAYS: "14",
  });

  assert.deepEqual(config, {
    frontendUrl: "http://localhost:4173",
    nodeEnv: "production",
    accessTokenCookieName: "custom_access",
    refreshTokenCookieName: "custom_refresh",
    accessTokenTtlMinutes: 20,
    refreshTokenTtlDays: 14,
    cookieSecure: false,
  });
});

test("token TTL parsers fall back to defaults for invalid values", () => {
  assert.equal(parseAccessTokenTtlMinutes(undefined), 15);
  assert.equal(parseAccessTokenTtlMinutes("0"), 15);
  assert.equal(parseAccessTokenTtlMinutes("-1"), 15);
  assert.equal(parseAccessTokenTtlMinutes("abc"), 15);

  assert.equal(parseRefreshTokenTtlDays(undefined), 30);
  assert.equal(parseRefreshTokenTtlDays("0"), 30);
  assert.equal(parseRefreshTokenTtlDays("-1"), 30);
  assert.equal(parseRefreshTokenTtlDays("abc"), 30);
});

test("health endpoint returns the expected payload", async () => {
  const app = createApp({
    frontendUrl: "http://localhost:5173",
    nodeEnv: "test",
    accessTokenCookieName: "test_access",
    refreshTokenCookieName: "test_refresh",
    accessTokenTtlMinutes: 15,
    refreshTokenTtlDays: 30,
    cookieSecure: false,
  });

  const server = app.listen(0);

  try {
    const address = server.address();

    if (!address || typeof address === "string") {
      throw new Error("Expected server to listen on a numeric port");
    }

    const response = await fetch(`http://127.0.0.1:${address.port}/api/health`);
    const payload = (await response.json()) as {
      success: boolean;
      message: string;
      data: {
        status: string;
      };
    };

    assert.equal(response.status, 200);
    assert.deepEqual(payload, {
      success: true,
      message: "Backend is running.",
      data: {
        status: "ok",
      },
    });
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

test("invalid JSON body returns a consistent bad request response", async () => {
  const app = createApp({
    frontendUrl: "http://localhost:5173",
    nodeEnv: "test",
    accessTokenCookieName: "test_access",
    refreshTokenCookieName: "test_refresh",
    accessTokenTtlMinutes: 15,
    refreshTokenTtlDays: 30,
    cookieSecure: false,
  });

  const server = app.listen(0);

  try {
    const address = server.address();

    if (!address || typeof address === "string") {
      throw new Error("Expected server to listen on a numeric port");
    }

    const response = await fetch(`http://127.0.0.1:${address.port}/api/auth/login`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: "{",
    });
    const payload = (await response.json()) as {
      success: boolean;
      message: string;
      errors: Record<string, string> | null;
    };

    assert.equal(response.status, 400);
    assert.deepEqual(payload, {
      success: false,
      message: "Request body must be valid JSON.",
      errors: null,
    });
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
