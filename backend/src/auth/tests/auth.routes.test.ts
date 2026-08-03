import assert from "node:assert/strict";
import test from "node:test";

import { createApp } from "../../app.js";
import type { AuthController } from "../auth.controller.js";
import { createAuthRoutes } from "../auth.routes.js";

const testConfig = {
  frontendUrl: "http://localhost:5173",
  nodeEnv: "test" as const,
  accessTokenCookieName: "test_access",
  refreshTokenCookieName: "test_refresh",
  accessTokenTtlMinutes: 15,
  refreshTokenTtlDays: 30,
  cookieSecure: false,
};

function createControllerRecorder() {
  const calls = {
    login: 0,
    refresh: 0,
    me: 0,
    logout: 0,
  };

  const controller: AuthController = {
    async login(_request, response) {
      calls.login += 1;
      response.status(200).json({
        success: true,
        message: "login",
        data: { ok: true },
      });
    },
    async refresh(_request, response) {
      calls.refresh += 1;
      response.status(200).json({
        success: true,
        message: "refresh",
        data: { ok: true },
      });
    },
    async me(_request, response) {
      calls.me += 1;
      response.status(200).json({
        success: true,
        message: "me",
        data: { ok: true },
      });
    },
    async logout(_request, response) {
      calls.logout += 1;
      response.status(204).send();
    },
  };

  return { controller, calls };
}

test("auth routes delegate to the controller handlers", async () => {
  const { controller, calls } = createControllerRecorder();
  const authRouter = createAuthRoutes(controller);
  const app = createApp(testConfig, { authRouter });
  const server = app.listen(0);

  try {
    const address = server.address();

    if (!address || typeof address === "string") {
      throw new Error("Expected numeric server port.");
    }

    const baseUrl = `http://127.0.0.1:${address.port}`;

    await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({}),
    });
    await fetch(`${baseUrl}/api/auth/refresh`, {
      method: "POST",
    });
    await fetch(`${baseUrl}/api/auth/me`);
    await fetch(`${baseUrl}/api/auth/logout`, {
      method: "POST",
    });

    assert.deepEqual(calls, {
      login: 1,
      refresh: 1,
      me: 1,
      logout: 1,
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
