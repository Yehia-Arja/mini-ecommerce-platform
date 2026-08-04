import assert from "node:assert/strict";
import test from "node:test";
import type { RequestHandler } from "express";

import { createApp } from "../../app.js";
import type { OrdersController } from "../orders.controller.js";
import { createOrdersRoutes } from "../orders.routes.js";

const testConfig = {
  frontendUrl: "http://localhost:5173",
  nodeEnv: "test" as const,
  accessTokenCookieName: "test_access",
  refreshTokenCookieName: "test_refresh",
  accessTokenTtlMinutes: 15,
  refreshTokenTtlDays: 30,
  cookieSecure: false,
};

test("orders routes require authentication before delegating to the controller", async () => {
  let middlewareCalls = 0;
  let placeOrderCalls = 0;
  let getOrderCalls = 0;

  const controller: OrdersController = {
    async placeOrder(_request, response) {
      placeOrderCalls += 1;
      response.status(201).json({
        success: true,
        message: "order",
        data: { ok: true },
      });
    },
    async getOrderById(_request, response) {
      getOrderCalls += 1;
      response.status(200).json({
        success: true,
        message: "get",
        data: { ok: true },
      });
    },
  };

  const requireAuth: RequestHandler = (_request, _response, next) => {
    middlewareCalls += 1;
    next();
  };

  const app = createApp(testConfig, {
    ordersRouter: createOrdersRoutes(controller, requireAuth),
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
      data: { ok: boolean };
    };

    assert.equal(response.status, 201);
    assert.deepEqual(payload, {
      success: true,
      message: "order",
      data: { ok: true },
    });
    assert.equal(middlewareCalls, 1);
    assert.equal(placeOrderCalls, 1);
    assert.equal(getOrderCalls, 0);
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

test("order details route requires authentication before delegating to the controller", async () => {
  let middlewareCalls = 0;
  let placeOrderCalls = 0;
  let getOrderCalls = 0;

  const controller: OrdersController = {
    async placeOrder(_request, response) {
      placeOrderCalls += 1;
      response.status(201).json({
        success: true,
        message: "order",
        data: { ok: true },
      });
    },
    async getOrderById(_request, response) {
      getOrderCalls += 1;
      response.status(200).json({
        success: true,
        message: "get",
        data: { ok: true },
      });
    },
  };

  const requireAuth: RequestHandler = (_request, _response, next) => {
    middlewareCalls += 1;
    next();
  };

  const app = createApp(testConfig, {
    ordersRouter: createOrdersRoutes(controller, requireAuth),
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
      data: { ok: boolean };
    };

    assert.equal(response.status, 200);
    assert.deepEqual(payload, {
      success: true,
      message: "get",
      data: { ok: true },
    });
    assert.equal(middlewareCalls, 1);
    assert.equal(placeOrderCalls, 0);
    assert.equal(getOrderCalls, 1);
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
