import assert from "node:assert/strict";
import test from "node:test";

import { createApp } from "../../app.js";
import { createRequireAuthMiddleware } from "../../auth/auth.middleware.js";
import type { AuthService } from "../../auth/auth.service.js";
import type { ProductsController } from "../products.controller.js";
import { createProductsRoutes } from "../products.routes.js";

const testConfig = {
  frontendUrl: "http://localhost:5173",
  nodeEnv: "test" as const,
  accessTokenCookieName: "test_access",
  refreshTokenCookieName: "test_refresh",
  accessTokenTtlMinutes: 15,
  refreshTokenTtlDays: 30,
  cookieSecure: false,
};

test("requireAuth middleware rejects unauthenticated access to protected product routes", async () => {
  const authService = {
    async getCurrentUser() {
      return null;
    },
  } satisfies Pick<AuthService, "getCurrentUser">;

  const requireAuth = createRequireAuthMiddleware(
    authService,
    testConfig,
  );

  const controller: ProductsController = {
    async listProducts(_request, response) {
      response.status(200).json({
        success: true,
        message: "products",
        data: { ok: true },
      });
    },
    async getProductById(_request, response) {
      response.status(200).json({
        success: true,
        message: "product",
        data: { ok: true },
      });
    },
  };

  const app = createApp(testConfig, {
    productsRouter: createProductsRoutes(controller, requireAuth),
  });

  const server = app.listen(0);

  try {
    const address = server.address();

    if (!address || typeof address === "string") {
      throw new Error("Expected numeric server port.");
    }

    const response = await fetch(
      `http://127.0.0.1:${address.port}/api/products`,
    );
    const payload = (await response.json()) as {
      success: boolean;
      message: string;
      errors: Record<string, string> | null;
    };

    assert.equal(response.status, 401);
    assert.deepEqual(payload, {
      success: false,
      message: "Authentication is required.",
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
