import assert from "node:assert/strict";
import test from "node:test";
import type { RequestHandler } from "express";

import { createApp } from "../../app.js";
import { createOrdersController } from "../orders.controller.js";
import { createOrdersRoutes } from "../orders.routes.js";
import type { OrdersServiceContract } from "../orders.service.js";

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

function createOrdersServiceStub(
  overrides: Partial<OrdersServiceContract> = {},
): OrdersServiceContract {
  return {
    async placeOrder() {
      return {
        id: "order-1",
        userId: "user-1",
        cartId: "cart-1",
        status: "confirmed",
        totalAmount: 25,
        totalQuantity: 1,
        items: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    },
    async getOrderById() {
      return {
        id: "order-1",
        userId: "user-1",
        cartId: "cart-1",
        status: "confirmed",
        totalAmount: 25,
        totalQuantity: 1,
        items: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    },
    ...overrides,
  };
}

test("get order rejects invalid route ids with a consistent bad request response", async () => {
  const service = createOrdersServiceStub();
  const controller = createOrdersController(service);
  const app = createApp(testConfig, {
    ordersRouter: createOrdersRoutes(controller, allowRequest),
  });
  const server = app.listen(0);

  try {
    const address = server.address();

    if (!address || typeof address === "string") {
      throw new Error("Expected numeric server port.");
    }

    const response = await fetch(
      `http://127.0.0.1:${address.port}/api/orders/not-a-uuid`,
    );
    const payload = (await response.json()) as {
      success: boolean;
      message: string;
      errors: Record<string, string> | null;
    };

    assert.equal(response.status, 400);
    assert.deepEqual(payload, {
      success: false,
      message: 'Route parameter "orderId" must be a valid UUID.',
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

test("place order returns a created order response", async () => {
  const service = createOrdersServiceStub();
  const controller = createOrdersController(service);
  const app = createApp(testConfig, {
    ordersRouter: createOrdersRoutes(controller, allowRequest),
  });
  const server = app.listen(0);

  try {
    const address = server.address();

    if (!address || typeof address === "string") {
      throw new Error("Expected numeric server port.");
    }

    const response = await fetch(`http://127.0.0.1:${address.port}/api/orders`, {
      method: "POST",
    });
    const payload = (await response.json()) as {
      success: boolean;
      message: string;
      data: {
        id: string;
      };
    };

    assert.equal(response.status, 201);
    assert.equal(payload.success, true);
    assert.equal(payload.message, "Order placed successfully.");
    assert.equal(payload.data.id, "order-1");
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

test("get order returns the order snapshot", async () => {
  const service = createOrdersServiceStub();
  const controller = createOrdersController(service);
  const app = createApp(testConfig, {
    ordersRouter: createOrdersRoutes(controller, allowRequest),
  });
  const server = app.listen(0);

  try {
    const address = server.address();

    if (!address || typeof address === "string") {
      throw new Error("Expected numeric server port.");
    }

    const response = await fetch(
      `http://127.0.0.1:${address.port}/api/orders/123e4567-e89b-12d3-a456-426614174000`,
    );
    const payload = (await response.json()) as {
      success: boolean;
      message: string;
      data: {
        id: string;
      };
    };

    assert.equal(response.status, 200);
    assert.equal(payload.success, true);
    assert.equal(payload.message, "Order retrieved successfully.");
    assert.equal(payload.data.id, "order-1");
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
