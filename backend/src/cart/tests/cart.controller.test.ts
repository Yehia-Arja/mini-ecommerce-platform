import assert from "node:assert/strict";
import test from "node:test";
import type { RequestHandler } from "express";

import { createApp } from "../../app.js";
import { createCartController } from "../cart.controller.js";
import { createCartRoutes } from "../cart.routes.js";
import type { CartServiceContract } from "../cart.service.js";

const testConfig = {
  frontendUrl: "http://localhost:5173",
  nodeEnv: "test" as const,
  accessTokenCookieName: "test_access",
  refreshTokenCookieName: "test_refresh",
  accessTokenTtlMinutes: 15,
  refreshTokenTtlDays: 30,
  cookieSecure: false,
};

const allowRequest: RequestHandler = (request, _response, next) => {
  request.user = {
    id: "user-1",
    firstName: "Yehia",
    lastName: null,
    email: "yehia@example.com",
    phoneNumber: null,
    status: "active",
    emailVerifiedAt: null,
    userType: "customer",
    loginCount: 0,
    lastLoginIp: null,
    lastLoginAt: null,
    language: "en",
    countryCode: null,
    registrationIp: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  next();
};

function createCartServiceStub(
  overrides: Partial<CartServiceContract> = {},
): CartServiceContract {
  return {
    async getCartByUserId() {
      return {
        id: "cart-1",
        userId: "user-1",
        status: "active",
        items: [],
        totalQuantity: 0,
        total: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    },
    async addItem() {
      return {
        id: "cart-1",
        userId: "user-1",
        status: "active",
        items: [],
        totalQuantity: 0,
        total: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    },
    async updateItem() {
      return {
        id: "cart-1",
        userId: "user-1",
        status: "active",
        items: [],
        totalQuantity: 0,
        total: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    },
    async removeItem() {},
    ...overrides,
  };
}

test("add cart item rejects invalid payloads with a consistent bad request response", async () => {
  const service = createCartServiceStub();
  const controller = createCartController(service);
  const app = createApp(testConfig, {
    cartRouter: createCartRoutes(controller, allowRequest),
  });
  const server = app.listen(0);

  try {
    const address = server.address();

    if (!address || typeof address === "string") {
      throw new Error("Expected numeric server port.");
    }

    const response = await fetch(`http://127.0.0.1:${address.port}/api/cart/items`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        productVariantId: "123e4567-e89b-12d3-a456-426614174000",
        quantity: 0,
      }),
    });
    const payload = (await response.json()) as {
      success: boolean;
      message: string;
      errors: Record<string, string> | null;
    };

    assert.equal(response.status, 400);
    assert.deepEqual(payload, {
      success: false,
      message: 'Body field "quantity" must be a positive integer.',
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

test("remove cart item returns no content", async () => {
  const service = createCartServiceStub();
  const controller = createCartController(service);
  const app = createApp(testConfig, {
    cartRouter: createCartRoutes(controller, allowRequest),
  });
  const server = app.listen(0);

  try {
    const address = server.address();

    if (!address || typeof address === "string") {
      throw new Error("Expected numeric server port.");
    }

    const response = await fetch(
      `http://127.0.0.1:${address.port}/api/cart/items/123e4567-e89b-12d3-a456-426614174000`,
      {
        method: "DELETE",
      },
    );

    assert.equal(response.status, 204);
    assert.equal(await response.text(), "");
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
