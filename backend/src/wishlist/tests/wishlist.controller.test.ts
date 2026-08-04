import assert from "node:assert/strict";
import test from "node:test";
import type { RequestHandler } from "express";

import { createApp } from "../../app.js";
import { createWishlistController } from "../wishlist.controller.js";
import { createWishlistRoutes } from "../wishlist.routes.js";
import type { WishlistServiceContract } from "../wishlist.service.js";

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

function createWishlistServiceStub(
  overrides: Partial<WishlistServiceContract> = {},
): WishlistServiceContract {
  return {
    async getWishlistByUserId() {
      return {
        userId: "user-1",
        items: [],
        totalItems: 0,
      };
    },
    async addItem() {
      return {
        userId: "user-1",
        items: [],
        totalItems: 0,
      };
    },
    async removeItem() {},
    ...overrides,
  };
}

test("add wishlist item rejects invalid payloads with a consistent bad request response", async () => {
  const service = createWishlistServiceStub();
  const controller = createWishlistController(service);
  const app = createApp(testConfig, {
    wishlistRouter: createWishlistRoutes(controller, allowRequest),
  });
  const server = app.listen(0);

  try {
    const address = server.address();

    if (!address || typeof address === "string") {
      throw new Error("Expected numeric server port.");
    }

    const response = await fetch(`http://127.0.0.1:${address.port}/api/wishlist/items`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        productId: "not-a-uuid",
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
      message: 'Body field "productId" must be a valid UUID.',
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

test("remove wishlist item returns no content", async () => {
  const service = createWishlistServiceStub();
  const controller = createWishlistController(service);
  const app = createApp(testConfig, {
    wishlistRouter: createWishlistRoutes(controller, allowRequest),
  });
  const server = app.listen(0);

  try {
    const address = server.address();

    if (!address || typeof address === "string") {
      throw new Error("Expected numeric server port.");
    }

    const response = await fetch(
      `http://127.0.0.1:${address.port}/api/wishlist/items/123e4567-e89b-12d3-a456-426614174000`,
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
