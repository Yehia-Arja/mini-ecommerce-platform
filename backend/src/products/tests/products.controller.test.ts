import assert from "node:assert/strict";
import test from "node:test";
import type { RequestHandler } from "express";

import { createApp } from "../../app.js";
import { HttpError } from "../../http/errors.js";
import { createProductsController } from "../products.controller.js";
import { createProductsRoutes } from "../products.routes.js";
import type { ProductsServiceContract } from "../products.service.js";

const testConfig = {
  frontendUrl: "http://localhost:5173",
  nodeEnv: "test" as const,
  accessTokenCookieName: "test_access",
  refreshTokenCookieName: "test_refresh",
  accessTokenTtlMinutes: 15,
  refreshTokenTtlDays: 30,
  cookieSecure: false,
};

const allowRequest: RequestHandler = (_request, _response, next) => {
  next();
};

function createProductsServiceStub(
  overrides: Partial<ProductsServiceContract> = {},
): ProductsServiceContract {
  return {
    async listProducts() {
      return {
        items: [],
        pagination: {
          page: 1,
          pageSize: 15,
          totalItems: 0,
          totalPages: 0,
        },
      };
    },
    async getProductById() {
      throw new Error("Not implemented in this test.");
    },
    ...overrides,
  };
}

test("product details rejects invalid product ids with a consistent bad request response", async () => {
  const service = createProductsServiceStub({
    async getProductById() {
      throw new Error("Service should not be called for invalid ids.");
    },
  });

  const controller = createProductsController(service);
  const app = createApp(testConfig, {
    productsRouter: createProductsRoutes(controller, allowRequest),
  });
  const server = app.listen(0);

  try {
    const address = server.address();

    if (!address || typeof address === "string") {
      throw new Error("Expected numeric server port.");
    }

    const response = await fetch(
      `http://127.0.0.1:${address.port}/api/products/not-a-uuid`,
    );
    const payload = (await response.json()) as {
      success: boolean;
      message: string;
      errors: Record<string, string> | null;
    };

    assert.equal(response.status, 400);
    assert.deepEqual(payload, {
      success: false,
      message: 'Route parameter "productId" must be a valid UUID.',
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

test("product details returns a consistent not found response when the product does not exist", async () => {
  const service = createProductsServiceStub({
    async getProductById() {
      throw new HttpError(404, "Product not found.");
    },
  });

  const controller = createProductsController(service);
  const app = createApp(testConfig, {
    productsRouter: createProductsRoutes(controller, allowRequest),
  });
  const server = app.listen(0);

  try {
    const address = server.address();

    if (!address || typeof address === "string") {
      throw new Error("Expected numeric server port.");
    }

    const response = await fetch(
      `http://127.0.0.1:${address.port}/api/products/123e4567-e89b-12d3-a456-426614174000`,
    );
    const payload = (await response.json()) as {
      success: boolean;
      message: string;
      errors: Record<string, string> | null;
    };

    assert.equal(response.status, 404);
    assert.deepEqual(payload, {
      success: false,
      message: "Product not found.",
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
