import assert from "node:assert/strict";
import test from "node:test";
import type { RequestHandler } from "express";

import { createApp } from "../../app.js";
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

test("products route requires authentication before delegating to the controller", async () => {
  let productsRouteCalls = 0;
  let middlewareCalls = 0;

  const controller: ProductsController = {
    async listProducts(_request, response) {
      productsRouteCalls += 1;
      response.status(200).json({
        success: true,
        message: "products",
        data: { ok: true },
      });
    },
  };

  const requireAuth: RequestHandler = (_request, _response, next) => {
    middlewareCalls += 1;
    next();
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
      `http://127.0.0.1:${address.port}/api/products?page=1&pageSize=15`,
    );
    const payload = (await response.json()) as {
      success: boolean;
      message: string;
      data: {
        ok: boolean;
      };
    };

    assert.equal(response.status, 200);
    assert.deepEqual(payload, {
      success: true,
      message: "products",
      data: { ok: true },
    });
    assert.equal(middlewareCalls, 1);
    assert.equal(productsRouteCalls, 1);
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
